const express = require('express');
const {
  getLibrarySummary,
  getPopularBooks,
  getOverdueBooks,
  getFinesReport
} = require('../controllers/reportController');
const { verifyToken, checkRole } = require('../middleware/auth');
const ROLES = require('../constants/roles');

const router = express.Router();

// Define authorized roles for reports
const authorizedRoles = [ROLES.ADMIN, ROLES.LIBRARIAN];

// @route   GET /api/reports/summary
router.route('/summary')
  .get(verifyToken, checkRole(authorizedRoles), getLibrarySummary);

// @route   GET /api/reports/popular-books
router.route('/popular-books')
  .get(verifyToken, checkRole(authorizedRoles), getPopularBooks);

// @route   GET /api/reports/overdue-books
router.route('/overdue-books')
  .get(verifyToken, checkRole(authorizedRoles), getOverdueBooks);

// @route   GET /api/reports/fines
router.route('/fines')
  .get(verifyToken, checkRole(authorizedRoles), getFinesReport);

// Add routes for more reports here

module.exports = router; 