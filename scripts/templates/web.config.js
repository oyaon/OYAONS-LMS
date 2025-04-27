module.exports = (envType) => {
  const configs = {
    development: {
      apiUrl: 'http://localhost:5000',
      dbPort: 27017,
      emailPort: 587,
      rateLimit: false,
      csrf: false,
      showErrors: true
    },
    production: {
      apiUrl: 'https://api.your-library.com',
      dbPort: 27017,
      emailPort: 587,
      rateLimit: true,
      csrf: true,
      showErrors: false
    },
    test: {
      apiUrl: 'http://localhost:5001',
      dbPort: 27018,
      emailPort: 2525,
      rateLimit: false,
      csrf: false,
      showErrors: true
    }
  };

  const config = configs[envType];

  return `module.exports = {
  // API Configuration
  API_URL: '${config.apiUrl}',
  API_TIMEOUT: 10000,

  // Security Features
  ENABLE_RATE_LIMIT: ${config.rateLimit},
  RATE_LIMIT_WINDOW: 60000,
  RATE_LIMIT_MAX_REQUESTS: 100,

  ENABLE_CSRF: ${config.csrf},
  CSRF_TOKEN_HEADER: 'X-CSRF-Token',

  ENABLE_AUDIT_LOG: true,
  AUDIT_LOG_LEVEL: '${envType === 'production' ? 'info' : 'debug'}',

  // Authentication
  AUTH_TOKEN_KEY: '${envType}_auth_token',
  AUTH_REFRESH_TOKEN_KEY: '${envType}_refresh_token',
  AUTH_TOKEN_EXPIRY: 3600,

  // Feature Flags
  ENABLE_EXPORT: true,
  ENABLE_BULK_ACTIONS: true,
  ENABLE_ADVANCED_FILTERS: true,

  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,

  // Error Handling
  SHOW_ERROR_DETAILS: ${config.showErrors},
  ERROR_MESSAGE_DURATION: 5000,

  // Database Configuration
  DB_HOST: 'localhost',
  DB_PORT: ${config.dbPort},
  DB_NAME: 'library_${envType}',

  // Email Configuration
  EMAIL_HOST: 'smtp.${envType}.com',
  EMAIL_PORT: ${config.emailPort},
  EMAIL_USER: '${envType}@example.com',
  EMAIL_PASSWORD: '${envType}_password',

  // File Upload Configuration
  MAX_FILE_SIZE: 5242880,
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'application/pdf'],

  // Cache Configuration
  CACHE_ENABLED: true,
  CACHE_TTL: 3600,

  // Monitoring
  ENABLE_MONITORING: true,
  MONITORING_INTERVAL: 300000${envType === 'test' ? `,

  // Test-Specific Configuration
  TEST_MODE: true,
  TEST_API_KEY: 'test-api-key',
  TEST_USER_ID: 'test-user-id',
  TEST_ADMIN_ID: 'test-admin-id',
  MOCK_API_DELAY: 100,
  TEST_DATA_DIR: './test-data'` : ''}
};`;
} 