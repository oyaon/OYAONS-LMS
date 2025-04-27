const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  author: {
    type: String,
    required: [true, 'Author is required'],
    trim: true
  },
  isbn: {
    type: String,
    required: [true, 'ISBN is required'],
    unique: true,
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  publisher: {
    type: String,
    trim: true
  },
  publicationYear: {
    type: Number
  },
  language: {
    type: String,
    default: 'English'
  },
  pages: {
    type: Number
  },
  copies: {
    type: Number,
    required: [true, 'Number of copies is required'],
    min: [1, 'At least one copy is required']
  },
  availableCopies: {
    type: Number,
    default: function() {
      return this.copies;
    }
  },
  location: {
    shelf: String,
    row: String
  },
  status: {
    type: String,
    enum: ['available', 'unavailable'],
    default: 'available'
  },
  coverImage: {
    type: String
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Update availableCopies when copies is modified
bookSchema.pre('save', function(next) {
  if (this.isModified('copies')) {
    this.availableCopies = this.copies;
  }
  next();
});

// Virtual for book copies
bookSchema.virtual('bookCopies', {
  ref: 'BookCopy',
  localField: '_id',
  foreignField: 'book'
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book; 