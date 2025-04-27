const express = require('express');
const { verifyToken, checkRole } = require('../middleware/auth');
const {
  getPaymentStats,
  getPaymentAnalytics
} = require('../controllers/paymentController');
const PDFService = require('../services/pdfService');
const Loan = require('../models/Loan');

const router = express.Router();

// @route   GET /api/payments/stats
// @desc    Get payment statistics
// @access  Private (Admin)
router.get('/stats', verifyToken, checkRole(['admin']), getPaymentStats);

// @route   GET /api/payments/analytics
// @desc    Get payment analytics
// @access  Private (Admin)
router.get('/analytics', verifyToken, checkRole(['admin']), getPaymentAnalytics);

// Generate and download receipt
router.get('/receipt/:loanId', verifyToken, async (req, res) => {
  try {
    if (!req.params.loanId) {
      return res.status(400).json({ message: 'Loan ID is required' });
    }

    const loan = await Loan.findById(req.params.loanId);
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    // Check if user is authorized to view this receipt
    if (req.user.role !== 'admin' && loan.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this receipt' });
    }

    const { filepath, filename } = await PDFService.generateReceipt(loan);
    res.download(filepath, filename, (err) => {
      if (err) {
        console.error('Error downloading receipt:', err);
        res.status(500).json({ message: 'Error downloading receipt' });
      }
    });
  } catch (error) {
    console.error('Error in receipt generation:', error);
    res.status(500).json({ message: 'Error generating receipt', error: error.message });
  }
});

// Generate and download invoice
router.get('/invoice/:loanId', verifyToken, async (req, res) => {
  try {
    if (!req.params.loanId) {
      return res.status(400).json({ message: 'Loan ID is required' });
    }

    const loan = await Loan.findById(req.params.loanId);
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    // Check if user is authorized to view this invoice
    if (req.user.role !== 'admin' && loan.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this invoice' });
    }

    const { filepath, filename } = await PDFService.generateInvoice(loan);
    res.download(filepath, filename, (err) => {
      if (err) {
        console.error('Error downloading invoice:', err);
        res.status(500).json({ message: 'Error downloading invoice' });
      }
    });
  } catch (error) {
    console.error('Error in invoice generation:', error);
    res.status(500).json({ message: 'Error generating invoice', error: error.message });
  }
});

module.exports = router; 