module.exports = (envType) => {
  const configs = {
    development: {
      port: 5000,
      mongoPort: 27017,
      emailPort: 587,
      rateLimit: false,
      csrf: false,
      showErrors: true
    },
    production: {
      port: 5000,
      mongoPort: 27017,
      emailPort: 587,
      rateLimit: true,
      csrf: true,
      showErrors: false
    },
    test: {
      port: 5001,
      mongoPort: 27018,
      emailPort: 2525,
      rateLimit: false,
      csrf: false,
      showErrors: true
    }
  };

  const config = configs[envType];

  const baseConfig = `module.exports = {
  // Server Configuration
  PORT: ${config.port},
  NODE_ENV: '${envType}',

  // Database Configuration
  MONGODB_URI: 'mongodb://localhost:${config.mongoPort}/library_${envType}',
  
  // JWT Configuration
  JWT_SECRET: '${envType}_jwt_secret',
  JWT_EXPIRY: '1h',
  REFRESH_TOKEN_SECRET: '${envType}_refresh_secret',
  REFRESH_TOKEN_EXPIRY: '7d',

  // Security
  CORS_ORIGIN: 'http://localhost:3000',
  RATE_LIMIT: {
    windowMs: 60000,
    max: 100
  },
  ENABLE_CSRF: ${config.csrf},

  // Email Configuration
  SMTP_HOST: 'smtp.${envType}.com',
  SMTP_PORT: ${config.emailPort},
  SMTP_USER: '${envType}@example.com',
  SMTP_PASS: '${envType}_password',
  EMAIL_FROM: 'noreply@library.com',

  // Logging
  LOG_LEVEL: '${envType === 'production' ? 'info' : 'debug'}',
  ENABLE_REQUEST_LOGGING: true,
  ENABLE_RESPONSE_LOGGING: true,

  // File Upload
  UPLOAD_DIR: './uploads',
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'application/pdf'],

  // Cache Configuration
  CACHE_TTL: 3600,
  REDIS_URL: 'redis://localhost:6379',

  // Session Configuration
  SESSION_SECRET: '${envType}_session_secret',
  SESSION_EXPIRY: '24h',

  // API Limits
  MAX_ITEMS_PER_PAGE: 100,
  DEFAULT_ITEMS_PER_PAGE: 10,

  // Feature Flags
  FEATURES: {
    ENABLE_REGISTRATION: true,
    ENABLE_PASSWORD_RESET: true,
    ENABLE_EMAIL_VERIFICATION: true,
    ENABLE_OAUTH: ${envType === 'production'},
    ENABLE_2FA: ${envType === 'production'}
  },

  // Monitoring
  ENABLE_MONITORING: true,
  MONITORING_INTERVAL: 300000,

  // Backup Configuration
  BACKUP_ENABLED: ${envType === 'production'},
  BACKUP_INTERVAL: '0 0 * * *', // Daily at midnight
  BACKUP_DIR: './backups',
  
  // Notification Configuration
  ENABLE_NOTIFICATIONS: true,
  NOTIFICATION_TYPES: ['email', 'in-app'],
  
  // Search Configuration
  ENABLE_FULL_TEXT_SEARCH: true,
  SEARCH_INDEX_UPDATE_INTERVAL: 300000 // 5 minutes`;

  const testConfig = envType === 'test' ? `,

  // Test-Specific Configuration
  TEST_MODE: true,
  TEST_API_KEY: 'test-api-key',
  TEST_USER_ID: 'test-user-id',
  TEST_ADMIN_ID: 'test-admin-id',
  MOCK_API_DELAY: 100,
  TEST_DATA_DIR: './test-data'` : '';

  return `${baseConfig}${testConfig}\n};`; 