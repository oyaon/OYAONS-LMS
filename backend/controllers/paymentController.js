const Loan = require('../models/Loan');
const { validationResult } = require('express-validator');

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