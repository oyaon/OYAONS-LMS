const mongoose = require('mongoose');

const bookCopySchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  barcode: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['available', 'borrowed', 'reserved', 'maintenance'],
    default: 'available'
  },
  condition: {
    type: String,
    enum: ['new', 'good', 'fair', 'poor'],
    default: 'good'
  },
  location: {
    shelf: String,
    row: String,
    position: String
  },
  lastBorrowed: Date,
  lastReturned: Date,
  notes: String
}, {
  timestamps: true
});

// Update book's availableCopies when copy status changes
bookCopySchema.post('save', async function() {
  const Book = mongoose.model('Book');
  const book = await Book.findById(this.book);
  
  if (book) {
    const availableCopies = await this.constructor.countDocuments({
      book: this.book,
      status: 'available'
    });
    
    book.availableCopies = availableCopies;
    await book.save();
  }
});

const BookCopy = mongoose.model('BookCopy', bookCopySchema);

module.exports = BookCopy; 