const Book = require('../models/Book');
const User = require('../models/User');
const Loan = require('../models/Loan');
// Add BookCopy model if it exists and is needed for copy count
// const BookCopy = require('../models/BookCopy');

// @desc    Get library summary statistics
// @route   GET /api/reports/summary
// @access  Private (Admin, Librarian)
exports.getLibrarySummary = async (req, res, next) => {
  try {
    const totalBooks = await Book.countDocuments();
    // const totalCopies = await BookCopy.countDocuments(); // Uncomment if using BookCopy model
    const totalUsers = await User.countDocuments();
    // Counting loans that are not returned yet
    const activeLoans = await Loan.countDocuments({ status: { $in: ['borrowed', 'overdue'] } }); 

    res.json({
      success: true,
      data: {
        totalBooks,
        // totalCopies, // Uncomment if using BookCopy model
        totalUsers,
        activeLoans,
      },
    });
  } catch (err) {
    next(err); // Pass error to central handler
  }
};

// @desc    Get most popular books (based on loan count)
// @route   GET /api/reports/popular-books
// @access  Private (Admin, Librarian)
exports.getPopularBooks = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10; // Get limit from query param or default to 10

    // Aggregate loans to count borrows per book
    const popularBooks = await Loan.aggregate([
      { $group: { _id: '$book', borrowCount: { $sum: 1 } } }, // Group by book ID and count loans
      { $sort: { borrowCount: -1 } }, // Sort by count descending
      { $limit: limit }, // Limit results
      {
        $lookup: { // Join with Books collection to get book details
          from: 'books', // The name of the books collection
          localField: '_id',
          foreignField: '_id',
          as: 'bookDetails'
        }
      },
      { $unwind: '$bookDetails' }, // Deconstruct the bookDetails array
      { 
        $project: { // Select and format the final output
          _id: 0, 
          bookId: '$_id', 
          title: '$bookDetails.title', 
          author: '$bookDetails.author', 
          borrowCount: 1 
        } 
      }
    ]);

    res.json({
      success: true,
      count: popularBooks.length,
      data: popularBooks,
    });
  } catch (err) {
    next(err); // Pass error to central handler
  }
};

// @desc    Get all overdue books
// @route   GET /api/reports/overdue-books
// @access  Private (Admin, Librarian)
exports.getOverdueBooks = async (req, res, next) => {
  try {
    const overdueLoans = await Loan.find({ status: 'overdue' })
      .populate('book', 'title isbn') // Populate book title and ISBN
      .populate('user', 'username email'); // Populate user username and email

    res.json({
      success: true,
      count: overdueLoans.length,
      data: overdueLoans.map(loan => ({ // Format the output slightly
        loanId: loan._id,
        bookTitle: loan.book?.title || 'N/A',
        isbn: loan.book?.isbn || 'N/A',
        borrowerUsername: loan.user?.username || 'N/A',
        borrowerEmail: loan.user?.email || 'N/A',
        borrowedDate: loan.borrowedDate,
        dueDate: loan.dueDate,
        fineAmount: loan.fine?.amount || 0
      }))
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get report on outstanding fines
// @route   GET /api/reports/fines
// @access  Private (Admin, Librarian)
exports.getFinesReport = async (req, res, next) => {
  try {
    // Find all loans with pending fines greater than 0
    const loansWithPendingFines = await Loan.find({
      'fine.status': 'pending',
      'fine.amount': { $gt: 0 }
    }).populate('user', 'username email');

    if (!loansWithPendingFines || loansWithPendingFines.length === 0) {
      return res.json({
        success: true,
        message: 'No pending fines found.',
        data: {
          totalPendingFineAmount: 0,
          usersWithPendingFinesCount: 0,
          usersWithFines: []
        }
      });
    }

    let totalPendingFineAmount = 0;
    const usersMap = new Map(); // To aggregate fines per user

    loansWithPendingFines.forEach(loan => {
      const userId = loan.user._id.toString();
      const fineAmount = loan.fine.amount;
      totalPendingFineAmount += fineAmount;

      if (usersMap.has(userId)) {
        usersMap.get(userId).totalFine += fineAmount;
        usersMap.get(userId).loans.push(loan._id);
      } else {
        usersMap.set(userId, {
          userId: loan.user._id,
          username: loan.user.username,
          email: loan.user.email,
          totalFine: fineAmount,
          loans: [loan._id] // Store loan IDs contributing to the fine
        });
      }
    });

    const usersWithFines = Array.from(usersMap.values());

    res.json({
      success: true,
      data: {
        totalPendingFineAmount,
        usersWithPendingFinesCount: usersWithFines.length,
        usersWithFines: usersWithFines.sort((a, b) => b.totalFine - a.totalFine) // Sort by highest fine
      }
    });

  } catch (err) {
    next(err);
  }
};

// Add more report functions here (e.g., fines report) 