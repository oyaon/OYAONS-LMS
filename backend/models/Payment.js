const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  loan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Loan',
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true,
    default: 'BDT'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending',
    required: true,
    index: true
  },
  paymentGateway: {
    type: String,
    enum: ['bkash', 'nagad', 'manual', 'other'],
    required: true
  },
  gatewayPaymentId: {
    type: String,
    index: true
  },
  gatewayTransactionId: {
    type: String,
    index: true
  },
  gatewayResponse: {
    type: mongoose.Schema.Types.Mixed
  },
  notes: String
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