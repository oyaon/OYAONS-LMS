const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  loan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Loan',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must be positive']
  },
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: ['cash', 'bkash', 'nagad', 'card', 'bank_transfer']
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    required: [true, 'Transaction ID is required'],
    unique: true
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: String,
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Update loan fine status when payment is completed
paymentSchema.post('save', async function() {
  if (this.status === 'completed') {
    const Loan = mongoose.model('Loan');
    const loan = await Loan.findById(this.loan);
    
    if (loan) {
      loan.fine.status = 'paid';
      loan.fine.paymentDate = this.paymentDate;
      loan.fine.paymentMethod = this.paymentMethod;
      await loan.save();
    }
  }
});

// Method to process payment
paymentSchema.methods.processPayment = async function(processedBy) {
  if (this.status !== 'pending') {
    throw new Error('Payment is not pending');
  }
  
  this.status = 'completed';
  this.processedBy = processedBy;
  return this.save();
};

// Method to refund payment
paymentSchema.methods.refund = async function(processedBy) {
  if (this.status !== 'completed') {
    throw new Error('Only completed payments can be refunded');
  }
  
  this.status = 'refunded';
  this.processedBy = processedBy;
  return this.save();
};

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment; 