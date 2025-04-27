require('dotenv').config();

module.exports = {
  // Server configuration
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // MongoDB configuration
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/library-management',

  // JWT configuration
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // Email configuration
  emailService: process.env.EMAIL_SERVICE || 'gmail',
  emailUser: process.env.EMAIL_USER,
  emailPass: process.env.EMAIL_PASS,
  emailFrom: process.env.EMAIL_FROM || 'noreply@library.com',

  // SMS configuration
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
  twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER,

  // File upload configuration
  maxFileSize: process.env.MAX_FILE_SIZE || 5 * 1024 * 1024, // 5MB
  allowedFileTypes: ['image/jpeg', 'image/png', 'application/pdf'],

  // Fine calculation
  finePerDay: process.env.FINE_PER_DAY || 10, // 10 BDT per day
  maxFineDays: process.env.MAX_FINE_DAYS || 30, // Maximum 30 days fine

  // Loan configuration
  maxLoanDuration: process.env.MAX_LOAN_DURATION || 14, // 14 days
  maxRenewals: process.env.MAX_RENEWALS || 2,
  renewalDuration: process.env.RENEWAL_DURATION || 7, // 7 days

  // Event configuration
  maxEventCapacity: process.env.MAX_EVENT_CAPACITY || 100,
  eventRegistrationDeadline: process.env.EVENT_REGISTRATION_DEADLINE || 24, // 24 hours before event

  // Notification configuration
  notificationPreferences: {
    email: true,
    sms: true,
    push: true
  }
}; 