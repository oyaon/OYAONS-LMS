const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  bookCopy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BookCopy',
    required: true
  },
  issueDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  returnDate: Date,
  status: {
    type: String,
    enum: ['active', 'returned', 'overdue', 'lost'],
    default: 'active'
  },
  fine: {
    amount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'waived'],
      default: 'pending'
    },
    paymentDate: Date,
    paymentMethod: String,
    notes: String
  },
  renewed: {
    type: Boolean,
    default: false
  },
  renewalCount: {
    type: Number,
    default: 0
  },
  notes: String
}, {
  timestamps: true
});

// Calculate fine when loan is returned
loanSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'returned' && !this.returnDate) {
    this.returnDate = new Date();
    
    // Calculate fine if overdue
    if (this.returnDate > this.dueDate) {
      const daysOverdue = Math.ceil((this.returnDate - this.dueDate) / (1000 * 60 * 60 * 24));
      this.fine.amount = daysOverdue * 10; // 10 BDT per day
    }
  }
  next();
});

// Update book copy status when loan status changes
loanSchema.post('save', async function() {
  const BookCopy = mongoose.model('BookCopy');
  const bookCopy = await BookCopy.findById(this.bookCopy);
  
  if (bookCopy) {
    if (this.status === 'returned') {
      bookCopy.status = 'available';
      bookCopy.lastReturned = new Date();
    } else if (this.status === 'active') {
      bookCopy.status = 'borrowed';
      bookCopy.lastBorrowed = new Date();
    }
    await bookCopy.save();
  }
});

const Loan = mongoose.model('Loan', loanSchema);

module.exports = Loan; 