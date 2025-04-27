const Loan = require('../models/Loan');
const Book = require('../models/Book');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Get all loans
// @route   GET /api/loans
// @access  Private
exports.getLoans = async (req, res) => {
  try {
    const { status, userId, bookId } = req.query;
    let query = {};

    if (status) query.status = status;
    if (userId) query.user = userId;
    if (bookId) query.book = bookId;

    const loans = await Loan.find(query)
      .populate('user', 'username email firstName lastName')
      .populate('book', 'title author isbn')
      .sort({ issueDate: -1 });

    res.json({
      success: true,
      count: loans.length,
      data: loans
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get single loan
// @route   GET /api/loans/:id
// @access  Private
exports.getLoan = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id)
      .populate('user', 'username email firstName lastName')
      .populate('book', 'title author isbn');

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      });
    }

    res.json({
      success: true,
      data: loan
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Create new loan
// @route   POST /api/loans
// @access  Private (Admin/Librarian)
exports.createLoan = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { userId, bookId, bookCopyId } = req.body;

    // Check if user exists and is active
    const user = await User.findById(userId);
    if (!user || !user.isActive) {
      return res.status(400).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    // Check if book exists and has available copies
    const book = await Book.findById(bookId);
    if (!book || book.availableCopies <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Book not found or not available'
      });
    }

    // Check if user has any unpaid fines
    const unpaidFines = await Loan.find({
      user: userId,
      'fine.status': 'unpaid'
    });

    if (unpaidFines.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User has unpaid fines'
      });
    }

    // Create loan
    const loan = await Loan.create({
      user: userId,
      book: bookId,
      bookCopy: bookCopyId,
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      status: 'active',
      createdBy: req.user.id
    });

    // Update book availability
    book.availableCopies -= 1;
    await book.save();

    res.status(201).json({
      success: true,
      data: loan
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Return book
// @route   PUT /api/loans/:id/return
// @access  Private (Admin/Librarian)
exports.returnBook = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      });
    }

    if (loan.status === 'returned') {
      return res.status(400).json({
        success: false,
        message: 'Book already returned'
      });
    }

    // Update loan status and return date
    loan.status = 'returned';
    loan.returnDate = new Date();
    loan.updatedBy = req.user.id;

    // Calculate fine if overdue
    const overdueDays = Math.max(0, Math.ceil((loan.returnDate - loan.dueDate) / (1000 * 60 * 60 * 24)));
    if (overdueDays > 0) {
      loan.fine = {
        amount: calculateFine(overdueDays),
        status: 'unpaid',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days to pay
      };
    }

    await loan.save();

    // Update book availability
    const book = await Book.findById(loan.book);
    if (book) {
      book.availableCopies += 1;
      await book.save();
    }

    res.json({
      success: true,
      data: loan
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Renew loan
// @route   PUT /api/loans/:id/renew
// @access  Private
exports.renewLoan = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      });
    }

    if (loan.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Cannot renew inactive loan'
      });
    }

    if (loan.renewalCount >= 2) {
      return res.status(400).json({
        success: false,
        message: 'Maximum renewals reached'
      });
    }

    // Check if there are any reservations for this book
    const hasReservations = await Loan.exists({
      book: loan.book,
      status: 'reserved'
    });

    if (hasReservations) {
      return res.status(400).json({
        success: false,
        message: 'Cannot renew: book has reservations'
      });
    }

    // Update loan
    loan.dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days from now
    loan.renewalCount += 1;
    loan.lastRenewalDate = new Date();
    loan.updatedBy = req.user.id;

    await loan.save();

    res.json({
      success: true,
      data: loan
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// Helper function to calculate fine
function calculateFine(overdueDays) {
  let fine = 0;
  if (overdueDays <= 7) {
    fine = overdueDays * 5; // 5 per day for first 7 days
  } else if (overdueDays <= 14) {
    fine = 35 + (overdueDays - 7) * 10; // 10 per day for next 7 days
  } else {
    fine = 105 + (overdueDays - 14) * 15; // 15 per day after 14 days
  }
  return fine;
} 