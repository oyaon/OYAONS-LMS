const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['book_fair', 'reading_club', 'author_talk', 'workshop', 'exhibition', 'other'],
    required: true
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: [1, 'Capacity must be at least 1']
  },
  registeredUsers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    attended: {
      type: Boolean,
      default: false
    }
  }],
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  coverImage: {
    url: String,
    thumbnail: String
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  requirements: [{
    type: String,
    trim: true
  }],
  notes: String,
  points: {
    type: Number,
    default: 0
  },
  notifications: [{
    type: {
      type: String,
      enum: ['reminder', 'update', 'cancellation'],
      required: true
    },
    message: String,
    sentAt: Date,
    recipients: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  }]
}, {
  timestamps: true
});

// Add text index for search
eventSchema.index({
  title: 'text',
  description: 'text',
  type: 'text',
  tags: 'text'
});

// Validate end date is after start date
eventSchema.pre('save', function(next) {
  if (this.endDate <= this.startDate) {
    next(new Error('End date must be after start date'));
  }
  next();
});

// Update status based on dates
eventSchema.pre('save', function(next) {
  const now = new Date();
  
  if (this.startDate > now) {
    this.status = 'upcoming';
  } else if (this.endDate < now) {
    this.status = 'completed';
  } else {
    this.status = 'ongoing';
  }
  
  next();
});

// Virtual for number of registered users
eventSchema.virtual('registeredCount').get(function() {
  return this.registeredUsers.length;
});

// Virtual for available spots
eventSchema.virtual('availableSpots').get(function() {
  return this.capacity - this.registeredUsers.length;
});

// Method to check if user is registered
eventSchema.methods.isUserRegistered = function(userId) {
  return this.registeredUsers.some(registration => 
    registration.user.toString() === userId.toString()
  );
};

// Method to register user
eventSchema.methods.registerUser = async function(userId) {
  if (this.isUserRegistered(userId)) {
    throw new Error('User already registered');
  }
  
  if (this.registeredCount >= this.capacity) {
    throw new Error('Event is full');
  }
  
  this.registeredUsers.push({
    user: userId,
    registeredAt: new Date()
  });
  
  return this.save();
};

// Method to unregister user
eventSchema.methods.unregisterUser = async function(userId) {
  const index = this.registeredUsers.findIndex(registration => 
    registration.user.toString() === userId.toString()
  );
  
  if (index === -1) {
    throw new Error('User is not registered');
  }
  
  this.registeredUsers.splice(index, 1);
  return this.save();
};

// Method to mark user attendance
eventSchema.methods.markAttendance = async function(userId) {
  const registration = this.registeredUsers.find(
    reg => reg.user.toString() === userId.toString()
  );
  
  if (!registration) {
    throw new Error('User not registered for this event');
  }
  
  registration.attended = true;
  await this.save();
};

const Event = mongoose.model('Event', eventSchema);

module.exports = Event; 