module.exports = {
  "PORT": 5000,
  "NODE_ENV": "production",
  "MONGODB_URI": "mongodb://localhost:27017/library_production",
  "JWT_SECRET": "production_jwt_secret",
  "JWT_EXPIRY": "1h",
  "REFRESH_TOKEN_SECRET": "production_refresh_secret",
  "REFRESH_TOKEN_EXPIRY": "7d",
  "CORS_ORIGIN": "http://localhost:3000",
  "RATE_LIMIT": {
    "windowMs": 60000,
    "max": 100
  },
  "ENABLE_CSRF": true,
  "SMTP_HOST": "smtp.production.com",
  "SMTP_PORT": 587,
  "SMTP_USER": "production@example.com",
  "SMTP_PASS": "production_password",
  "EMAIL_FROM": "noreply@library.com",
  "LOG_LEVEL": "info",
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
  "SESSION_SECRET": "production_session_secret",
  "SESSION_EXPIRY": "24h",
  "MAX_ITEMS_PER_PAGE": 100,
  "DEFAULT_ITEMS_PER_PAGE": 10,
  "FEATURES": {
    "ENABLE_REGISTRATION": true,
    "ENABLE_PASSWORD_RESET": true,
    "ENABLE_EMAIL_VERIFICATION": true,
    "ENABLE_OAUTH": true,
    "ENABLE_2FA": true
  },
  "ENABLE_MONITORING": true,
  "MONITORING_INTERVAL": 300000,
  "BACKUP_ENABLED": true,
  "BACKUP_INTERVAL": "0 0 * * *",
  "BACKUP_DIR": "./backups",
  "ENABLE_NOTIFICATIONS": true,
  "NOTIFICATION_TYPES": [
    "email",
    "in-app"
  ],
  "ENABLE_FULL_TEXT_SEARCH": true,
  "SEARCH_INDEX_UPDATE_INTERVAL": 300000
};