module.exports = {
  "PORT": 5001,
  "NODE_ENV": "test",
  "MONGODB_URI": "mongodb://localhost:27018/library_test",
  "JWT_SECRET": "test_jwt_secret",
  "JWT_EXPIRY": "1h",
  "REFRESH_TOKEN_SECRET": "test_refresh_secret",
  "REFRESH_TOKEN_EXPIRY": "7d",
  "CORS_ORIGIN": "http://localhost:3000",
  "RATE_LIMIT": {
    "windowMs": 60000,
    "max": 100
  },
  "ENABLE_CSRF": false,
  "SMTP_HOST": "smtp.test.com",
  "SMTP_PORT": 2525,
  "SMTP_USER": "test@example.com",
  "SMTP_PASS": "test_password",
  "EMAIL_FROM": "noreply@library.com",
  "LOG_LEVEL": "debug",
  "ENABLE_REQUEST_LOGGING": true,
  "ENABLE_RESPONSE_LOGGING": true,
  "UPLOAD_DIR": "./uploads",
  "MAX_FILE_SIZE": 5242880,
  "ALLOWED_FILE_TYPES": [
    "image/jpeg",
    "image/png",
    "application/pdf"
  ],
  "CACHE_TTL": 3600,
  "REDIS_URL": "redis://localhost:6379",
  "SESSION_SECRET": "test_session_secret",
  "SESSION_EXPIRY": "24h",
  "MAX_ITEMS_PER_PAGE": 100,
  "DEFAULT_ITEMS_PER_PAGE": 10,
  "FEATURES": {
    "ENABLE_REGISTRATION": true,
    "ENABLE_PASSWORD_RESET": true,
    "ENABLE_EMAIL_VERIFICATION": true,
    "ENABLE_OAUTH": false,
    "ENABLE_2FA": false
  },
  "ENABLE_MONITORING": true,
  "MONITORING_INTERVAL": 300000,
  "BACKUP_ENABLED": false,
  "BACKUP_INTERVAL": "0 0 * * *",
  "BACKUP_DIR": "./backups",
  "ENABLE_NOTIFICATIONS": true,
  "NOTIFICATION_TYPES": [
    "email",
    "in-app"
  ],
  "ENABLE_FULL_TEXT_SEARCH": true,
  "SEARCH_INDEX_UPDATE_INTERVAL": 300000,
  "TEST_MODE": true,
  "TEST_API_KEY": "test-api-key",
  "TEST_USER_ID": "test-user-id",
  "TEST_ADMIN_ID": "test-admin-id",
  "MOCK_API_DELAY": 100,
  "TEST_DATA_DIR": "./test-data"
};