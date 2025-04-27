const jwt = require('jsonwebtoken');
const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const User = require('../models/User');

// Configure Passport JWT Strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
};

passport.use(new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    const user = await User.findById(payload.id);
    if (user) {
      return done(null, user);
    }
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
}));

// Middleware to verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'User account is deactivated' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Role-based access control middleware
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};

// Middleware to check if user has unpaid fines
const checkUnpaidFines = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'loans',
      match: { 
        'fine.status': 'pending',
        'fine.amount': { $gt: 0 }
      }
    });

    if (user.loans && user.loans.length > 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. User has unpaid fines.',
        fines: user.loans.map(loan => ({
          loanId: loan._id,
          amount: loan.fine.amount
        }))
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error checking user fines.'
    });
  }
};

module.exports = {
  verifyToken,
  checkRole,
  checkUnpaidFines,
  passport
}; 