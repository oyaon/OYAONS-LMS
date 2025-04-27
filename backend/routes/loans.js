const express = require('express');
const { check } = require('express-validator');
const { checkRole } = require('../middleware/auth');
const {
  getLoans,
  getLoan,
  createLoan,
  returnBook,
  renewLoan
} = require('../controllers/loanController');

const router = express.Router();

// @route   GET /api/loans
// @desc    Get all loans
// @access  Private
router.get('/', getLoans);

// @route   GET /api/loans/:id
// @desc    Get single loan
// @access  Private
router.get('/:id', getLoan);

// @route   POST /api/loans
// @desc    Create new loan
// @access  Private (Admin/Librarian)
router.post(
  '/',
  [
    checkRole(['admin', 'librarian']),
    check('userId', 'User ID is required').not().isEmpty(),
    check('bookId', 'Book ID is required').not().isEmpty(),
    check('bookCopyId', 'Book copy ID is required').not().isEmpty()
  ],
  createLoan
);

// @route   PUT /api/loans/:id/return
// @desc    Return book
// @access  Private (Admin/Librarian)
router.put(
  '/:id/return',
  checkRole(['admin', 'librarian']),
  returnBook
);

// @route   PUT /api/loans/:id/renew
// @desc    Renew loan
// @access  Private
router.put('/:id/renew', renewLoan);

module.exports = router; 