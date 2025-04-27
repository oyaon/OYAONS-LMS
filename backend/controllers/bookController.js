const Book = require('../models/Book');
const { validationResult } = require('express-validator');

// @desc    Get all books
// @route   GET /api/books
// @access  Public
exports.getBooks = async (req, res) => {
  try {
    const { search, genre, language, available } = req.query;
    let query = {};

    // Search by title, author, or description
    if (search) {
      query.$text = { $search: search };
    }

    // Filter by genre
    if (genre) {
      query.genre = genre;
    }

    // Filter by language
    if (language) {
      query.language = language;
    }

    // Filter by availability
    if (available === 'true') {
      query.availableCopies = { $gt: 0 };
    }

    const books = await Book.find(query)
      .select('-copies')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: books.length,
      data: books
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get single book
// @route   GET /api/books/:id
// @access  Public
exports.getBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    res.json({
      success: true,
      data: book
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Create new book
// @route   POST /api/books
// @access  Private (Admin/Librarian)
exports.createBook = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const book = await Book.create(req.body);

    res.status(201).json({
      success: true,
      data: book
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Update book
// @route   PUT /api/books/:id
// @access  Private (Admin/Librarian)
exports.updateBook = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    let book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      data: book
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Delete book
// @route   DELETE /api/books/:id
// @access  Private (Admin)
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    await book.remove();

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Check book availability
// @route   GET /api/books/:id/availability
// @access  Public
exports.checkAvailability = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    res.json({
      success: true,
      availableCopies: book.availableCopies,
      totalCopies: book.totalCopies
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
}; 