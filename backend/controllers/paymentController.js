const Loan = require('../models/Loan');
const Payment = require('../models/Payment'); // Import Payment model
const { createBkashPayment } = require('../services/bkashService'); // Import Bkash service
const { validationResult } = require('express-validator');

// @desc    Initiate a Bkash payment for a specific loan fine
// @route   POST /api/payments/initiate/bkash/:loanId
// @access  Private (User owning the loan)
exports.initiateBkashPayment = async (req, res, next) => {
  try {
    const { loanId } = req.params;
    const userId = req.user.id; // From verifyToken middleware

    // 1. Find the loan and validate
    const loan = await Loan.findById(loanId);

    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan not found' });
    }
    if (loan.user.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to pay for this loan' });
    }
    if (loan.fine.status !== 'pending' || !loan.fine.amount || loan.fine.amount <= 0) {
      return res.status(400).json({ success: false, message: 'No pending fine applicable for this loan' });
    }

    const amount = loan.fine.amount;

    // 2. Create a pending Payment record in our DB
    const newPayment = new Payment({
      user: userId,
      loan: loanId,
      amount: amount,
      currency: 'BDT',
      status: 'pending',
      paymentGateway: 'bkash',
    });
    await newPayment.save();
    const ourPaymentId = newPayment._id.toString();

    // 3. Call Bkash Create Payment API
    const bkashResponse = await createBkashPayment(amount, ourPaymentId); // Use our _id as merchantInvoiceNumber

    // 4. Update our Payment record with Bkash paymentID
    newPayment.gatewayPaymentId = bkashResponse.paymentID;
    await newPayment.save();

    // 5. Send Bkash URL back to frontend
    res.json({
      success: true,
      bkashURL: bkashResponse.bkashURL,
      paymentId: ourPaymentId // Send our internal payment ID too if needed
    });

  } catch (error) {
    // If Bkash call fails or DB save fails, pass error
    console.error('Error initiating Bkash payment:', error);
    // Optionally, update our Payment record status to 'failed' here
    // await Payment.findByIdAndUpdate(ourPaymentId, { status: 'failed', gatewayResponse: { error: error.message } });
    next(error); // Let central handler respond
  }
};

// @desc    Get payment statistics
// @route   GET /api/payments/stats
// @access  Private (Admin)
exports.getPaymentStats = async (req, res) => {
  try {
    const { period = 'month', startDate, endDate } = req.query;
    
    // Default date range if not provided
    const now = new Date();
    const defaultStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const defaultEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const queryStartDate = startDate ? new Date(startDate) : defaultStartDate;
    const queryEndDate = endDate ? new Date(endDate) : defaultEndDate;

    // Aggregate payment statistics
    const stats = await Loan.aggregate([
      {
        $match: {
          'fine.status': 'paid',
          'fine.paymentDate': {
            $gte: queryStartDate,
            $lte: queryEndDate
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: period === 'day' ? '%Y-%m-%d' : '%Y-%m',
              date: '$fine.paymentDate'
            }
          },
          totalAmount: { $sum: '$fine.amount' },
          count: { $sum: 1 },
          byMethod: {
            $push: {
              method: '$fine.paymentMethod',
              amount: '$fine.amount'
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          totalAmount: 1,
          count: 1,
          methods: {
            $reduce: {
              input: '$byMethod',
              initialValue: {},
              in: {
                $mergeObjects: [
                  '$$value',
                  {
                    [$$this.method]: {
                      $sum: ['$$value[$$this.method]', '$$this.amount']
                    }
                  }
                ]
              }
            }
          }
        }
      },
      { $sort: { date: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        period,
        startDate: queryStartDate,
        endDate: queryEndDate,
        stats
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get payment analytics
// @route   GET /api/payments/analytics
// @access  Private (Admin)
exports.getPaymentAnalytics = async (req, res) => {
  try {
    const analytics = await Loan.aggregate([
      {
        $match: {
          'fine.status': 'paid'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$fine.amount' },
          totalTransactions: { $sum: 1 },
          averageFine: { $avg: '$fine.amount' },
          byMethod: {
            $push: {
              method: '$fine.paymentMethod',
              amount: '$fine.amount'
            }
          },
          byMonth: {
            $push: {
              month: { $month: '$fine.paymentDate' },
              amount: '$fine.amount'
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalRevenue: 1,
          totalTransactions: 1,
          averageFine: 1,
          paymentMethods: {
            $reduce: {
              input: '$byMethod',
              initialValue: {},
              in: {
                $mergeObjects: [
                  '$$value',
                  {
                    [$$this.method]: {
                      total: { $sum: ['$$value[$$this.method].total', '$$this.amount'] },
                      count: { $sum: ['$$value[$$this.method].count', 1] }
                    }
                  }
                ]
              }
            }
          },
          monthlyStats: {
            $reduce: {
              input: '$byMonth',
              initialValue: {},
              in: {
                $mergeObjects: [
                  '$$value',
                  {
                    [$$this.month]: {
                      total: { $sum: ['$$value[$$this.month].total', '$$this.amount'] },
                      count: { $sum: ['$$value[$$this.month].count', 1] }
                    }
                  }
                ]
              }
            }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: analytics[0] || {
        totalRevenue: 0,
        totalTransactions: 0,
        averageFine: 0,
        paymentMethods: {},
        monthlyStats: {}
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
}; 