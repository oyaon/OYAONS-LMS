const express = require('express');
const { verifyToken, checkRole } = require('../middleware/auth');
const {
  getPaymentStats,
  getPaymentAnalytics,
  initiateBkashPayment
} = require('../controllers/paymentController');
const { executeBkashPayment } = require('../services/bkashService');
const Payment = require('../models/Payment');
const Loan = require('../models/Loan');
const PDFService = require('../services/pdfService');

const router = express.Router();

// Frontend URLs - should ideally come from environment variables
const FRONTEND_PAYMENT_SUCCESS_URL = process.env.FRONTEND_PAYMENT_SUCCESS_URL || '/payment/success';
const FRONTEND_PAYMENT_FAILURE_URL = process.env.FRONTEND_PAYMENT_FAILURE_URL || '/payment/failure';

// @route   POST /api/payments/initiate/bkash/:loanId
// @desc    Initiate Bkash payment for a specific loan fine
// @access  Private (User owning the loan)
router.post('/initiate/bkash/:loanId', verifyToken, initiateBkashPayment);

// @route   GET /api/payments/bkash/callback
// @desc    Callback URL for Bkash to notify payment status
// @access  Public (Called by Bkash)
router.get('/bkash/callback', async (req, res) => {
  const { paymentID, status } = req.query;
  console.log(`Bkash Callback Received - paymentID: ${paymentID}, status: ${status}`);

  let redirectURL = `${FRONTEND_PAYMENT_FAILURE_URL}?reason=invalid_callback`;

  if (!paymentID || !status) {
    console.error('Bkash callback missing paymentID or status');
    return res.redirect(redirectURL);
  }

  // Find our corresponding Payment record initiated earlier
  let paymentRecord;
  try {
      paymentRecord = await Payment.findOne({ gatewayPaymentId: paymentID });
  } catch (dbError) {
      console.error(`Error finding payment record for paymentID ${paymentID}:`, dbError);
      return res.redirect(`${FRONTEND_PAYMENT_FAILURE_URL}?reason=internal_error`);
  }

  if (!paymentRecord) {
      console.error(`Payment record not found for paymentID ${paymentID}`);
      return res.redirect(`${FRONTEND_PAYMENT_FAILURE_URL}?reason=payment_not_found`);
  }

  // Avoid processing already completed/failed payments again
  if (paymentRecord.status !== 'pending') {
      console.warn(`Payment ${paymentRecord._id} already processed with status: ${paymentRecord.status}`);
      redirectURL = paymentRecord.status === 'completed' 
          ? `${FRONTEND_PAYMENT_SUCCESS_URL}?loanId=${paymentRecord.loan}` 
          : `${FRONTEND_PAYMENT_FAILURE_URL}?loanId=${paymentRecord.loan}&reason=already_processed`;
      return res.redirect(redirectURL);
  }

  // Handle direct failure/cancellation from callback query status
  if (status !== 'success') {
    console.warn(`Bkash payment failed or cancelled by user. Status: ${status}`);
    paymentRecord.status = status === 'cancel' ? 'cancelled' : 'failed';
    paymentRecord.gatewayResponse = { callbackStatus: status };
    await paymentRecord.save();
    return res.redirect(`${FRONTEND_PAYMENT_FAILURE_URL}?loanId=${paymentRecord.loan}&reason=${status}`);
  }

  // --- Status is 'success', now EXECUTE the payment --- 
  try {
    console.log(`Callback status success, attempting to execute paymentID: ${paymentID}`);
    const executeResponse = await executeBkashPayment(paymentID);
    console.log('Bkash Execute Response:', executeResponse);

    // Store the raw execute response
    paymentRecord.gatewayResponse = executeResponse;

    // Check Bkash execute response status
    // Common success indicators: transactionStatus: 'Completed', statusCode: '0000'
    // Check for other statuses like Initiated, Pending, Failed, Cancelled
    if (executeResponse.transactionStatus === 'Completed' && executeResponse.trxID) {
      console.log(`Payment ${paymentID} executed successfully. TrxID: ${executeResponse.trxID}`);
      
      // Update our Payment record
      paymentRecord.status = 'completed';
      paymentRecord.gatewayTransactionId = executeResponse.trxID;
      await paymentRecord.save();
      
      // Update the corresponding Loan fine status
      const loan = await Loan.findById(paymentRecord.loan);
      if (loan && loan.fine.status === 'pending') {
        loan.fine.status = 'paid';
        loan.fine.paymentDate = new Date(); // Use current time as payment date
        loan.fine.paymentMethod = 'bkash';
        loan.fine.notes = `Paid via Bkash. TrxID: ${executeResponse.trxID}`;
        await loan.save();
        console.log(`Loan ${loan._id} fine status updated to paid.`);
        // Optionally emit Socket.IO event here to notify frontend
      } else {
          console.warn(`Loan ${paymentRecord.loan} not found or fine already paid/waived.`);
      }

      redirectURL = `${FRONTEND_PAYMENT_SUCCESS_URL}?loanId=${paymentRecord.loan}&trxId=${executeResponse.trxID}`;
    } else {
      console.error(`Bkash execute failed or status not Completed. Status: ${executeResponse.transactionStatus}, Message: ${executeResponse.statusMessage}`);
      paymentRecord.status = 'failed';
      paymentRecord.gatewayTransactionId = executeResponse.trxID; // Store TrxID even if failed
      await paymentRecord.save();
      redirectURL = `${FRONTEND_PAYMENT_FAILURE_URL}?loanId=${paymentRecord.loan}&reason=execute_failed&code=${executeResponse.statusCode || 'N/A'}`;
    }

  } catch (error) {
    console.error(`Error executing Bkash payment for paymentID ${paymentID}:`, error);
    // Update payment status to failed if execute call threw an error
    try {
        paymentRecord.status = 'failed';
        paymentRecord.gatewayResponse = { executeError: error.message };
        await paymentRecord.save();
    } catch (saveError) {
        console.error('Failed to save payment record status after execute error:', saveError);
    }
    redirectURL = `${FRONTEND_PAYMENT_FAILURE_URL}?loanId=${paymentRecord.loan}&reason=execute_exception`;
  }

  console.log(`Redirecting user to: ${redirectURL}`);
  res.redirect(redirectURL);
});

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