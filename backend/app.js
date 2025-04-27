const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const passport = require('passport');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const userRoutes = require('./routes/users');
const loanRoutes = require('./routes/loans');
const eventRoutes = require('./routes/events');
const paymentRoutes = require('./routes/payments');

// Import middleware
const { verifyToken, checkRole } = require('./middleware/auth');
const { errorHandler } = require('./middleware/error');
const ROLES = require('./constants/roles'); // Import roles constants

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Health check route
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Library Management System API is running',
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', verifyToken, bookRoutes);
app.use('/api/users', verifyToken, checkRole([ROLES.ADMIN]), userRoutes);
app.use('/api/loans', verifyToken, loanRoutes);
app.use('/api/events', verifyToken, eventRoutes);
app.use('/api/payments', verifyToken, paymentRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

module.exports = app; 