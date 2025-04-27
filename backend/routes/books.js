const express = require('express');
const { check } = require('express-validator');
const { checkRole } = require('../middleware/auth');
const {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  checkAvailability
} = require('../controllers/bookController');

const router = express.Router();

// @route   GET /api/books
// @desc    Get all books
// @access  Public
router.get('/', getBooks);

// @route   GET /api/books/:id
// @desc    Get single book
// @access  Public
router.get('/:id', getBook);

// @route   POST /api/books
// @desc    Create new book
// @access  Private (Admin/Librarian)
router.post(
  '/',
  [
    checkRole(['admin', 'librarian']),
    check('title', 'Title is required').not().isEmpty(),
    check('author', 'Author is required').not().isEmpty(),
    check('isbn', 'ISBN is required').not().isEmpty(),
    check('publisher', 'Publisher is required').not().isEmpty(),
    check('publicationYear', 'Publication year is required').isNumeric(),
    check('language', 'Language is required').isIn(['en', 'bn', 'ar'])
  ],
  createBook
);

// @route   PUT /api/books/:id
// @desc    Update book
// @access  Private (Admin/Librarian)
router.put(
  '/:id',
  [
    checkRole(['admin', 'librarian']),
    check('title', 'Title is required').not().isEmpty(),
    check('author', 'Author is required').not().isEmpty(),
    check('isbn', 'ISBN is required').not().isEmpty(),
    check('publisher', 'Publisher is required').not().isEmpty(),
    check('publicationYear', 'Publication year is required').isNumeric(),
    check('language', 'Language is required').isIn(['en', 'bn', 'ar'])
  ],
  updateBook
);

// @route   DELETE /api/books/:id
// @desc    Delete book
// @access  Private (Admin)
router.delete('/:id', checkRole(['admin']), deleteBook);

// @route   GET /api/books/:id/availability
// @desc    Check book availability
// @access  Public
router.get('/:id/availability', checkAvailability);

module.exports = router; 