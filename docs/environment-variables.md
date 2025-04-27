# Environment Variables Documentation

This document describes all environment variables used in the Library Management System.

## Table of Contents
- [API Configuration](#api-configuration)
- [Security Features](#security-features)
- [Authentication](#authentication)
- [Feature Flags](#feature-flags)
- [Pagination](#pagination)
- [Error Handling](#error-handling)
- [Database Configuration](#database-configuration)
- [Email Configuration](#email-configuration)
- [File Upload Configuration](#file-upload-configuration)
- [Cache Configuration](#cache-configuration)
- [Monitoring](#monitoring)
- [Backend Configuration](#backend-configuration)

## API Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_REACT_APP_API_URL` | Base URL for API requests | `http://localhost:5000` | Yes |
| `VITE_REACT_APP_API_TIMEOUT` | API request timeout in milliseconds | `10000` | Yes |

## Security Features

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_REACT_APP_ENABLE_RATE_LIMIT` | Enable/disable rate limiting | `true` | Yes |
| `VITE_REACT_APP_RATE_LIMIT_WINDOW` | Rate limit window in milliseconds | `60000` | No |
| `VITE_REACT_APP_RATE_LIMIT_MAX_REQUESTS` | Maximum requests per window | `100` | No |
| `VITE_REACT_APP_ENABLE_CSRF` | Enable/disable CSRF protection | `true` | Yes |
| `VITE_REACT_APP_CSRF_TOKEN_HEADER` | CSRF token header name | `X-CSRF-Token` | No |
| `VITE_REACT_APP_ENABLE_AUDIT_LOG` | Enable/disable audit logging | `true` | Yes |
| `VITE_REACT_APP_AUDIT_LOG_LEVEL` | Audit log level (debug/info/warn/error) | `info` | No |

## Authentication

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_REACT_APP_AUTH_TOKEN_KEY` | Key for storing auth token | `auth_token` | Yes |
| `VITE_REACT_APP_AUTH_REFRESH_TOKEN_KEY` | Key for storing refresh token | `refresh_token` | Yes |
| `VITE_REACT_APP_AUTH_TOKEN_EXPIRY` | Token expiry time in seconds | `3600` | Yes |

## Feature Flags

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_REACT_APP_ENABLE_EXPORT` | Enable/disable export functionality | `true` | No |
| `VITE_REACT_APP_ENABLE_BULK_ACTIONS` | Enable/disable bulk actions | `true` | No |
| `VITE_REACT_APP_ENABLE_ADVANCED_FILTERS` | Enable/disable advanced filters | `true` | No |

## Pagination

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_REACT_APP_DEFAULT_PAGE_SIZE` | Default number of items per page | `10` | No |
| `VITE_REACT_APP_MAX_PAGE_SIZE` | Maximum number of items per page | `100` | No |

## Error Handling

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_REACT_APP_SHOW_ERROR_DETAILS` | Show detailed error messages | `true` | No |
| `VITE_REACT_APP_ERROR_MESSAGE_DURATION` | Error message display duration in ms | `5000` | No |

## Database Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_REACT_APP_DB_HOST` | Database host | `localhost` | Yes (Prod) |
| `VITE_REACT_APP_DB_PORT` | Database port | `27017` | Yes (Prod) |
| `VITE_REACT_APP_DB_NAME` | Database name | `library_db` | Yes (Prod) |

## Email Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_REACT_APP_EMAIL_HOST` | SMTP host | - | Yes (Prod) |
| `VITE_REACT_APP_EMAIL_PORT` | SMTP port | `587` | Yes (Prod) |
| `VITE_REACT_APP_EMAIL_USER` | SMTP username | - | Yes (Prod) |
| `VITE_REACT_APP_EMAIL_PASSWORD` | SMTP password | - | Yes (Prod) |

## File Upload Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_REACT_APP_MAX_FILE_SIZE` | Maximum file size in bytes | `5242880` | No |
| `VITE_REACT_APP_ALLOWED_FILE_TYPES` | Comma-separated list of allowed MIME types | `image/jpeg,image/png,application/pdf` | No |

## Cache Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_REACT_APP_CACHE_ENABLED` | Enable/disable caching | `true` | No |
| `VITE_REACT_APP_CACHE_TTL` | Cache time-to-live in seconds | `3600` | No |

## Monitoring

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_REACT_APP_ENABLE_MONITORING` | Enable/disable monitoring | `true` | No |
| `VITE_REACT_APP_MONITORING_INTERVAL` | Monitoring check interval in ms | `300000` | No |

## Backend Configuration

These variables are typically used by the Node.js backend and are not prefixed.

| Variable | Description | Default (from code) | Required |
|----------|-------------|---------|----------|
| `PORT` | Port the backend server listens on | `5000` | No |
| `NODE_ENV` | Node environment | `development` | No |
| `CLIENT_URL` | URL of the frontend application (for CORS) | `http://localhost:3000` | No |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/smart-lms` or `mongodb://localhost:27017/library-management` | Yes (Prod) |
| `JWT_SECRET` | Secret key for signing JWT tokens | `your-secret-key` | Yes |
| `JWT_EXPIRES_IN` | Expiry time for JWT tokens | `7d` | No |
| `EMAIL_SERVICE` | Email service provider (e.g., 'gmail') | `gmail` | No |
| `EMAIL_USER` | Username for email account | - | Yes (Prod) |
| `EMAIL_PASS` | Password for email account | - | Yes (Prod) |
| `EMAIL_FROM` | Default sender email address | `noreply@library.com` | No |
| `TWILIO_ACCOUNT_SID` | Twilio Account SID (for SMS) | - | No |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token (for SMS) | - | No |
| `TWILIO_PHONE_NUMBER` | Twilio phone number (for SMS) | - | No |
| `MAX_FILE_SIZE` | Maximum upload file size in bytes | `5242880` (5MB) | No |
| `FINE_PER_DAY` | Fine amount per day for overdue books | `10` | No |
| `MAX_FINE_DAYS` | Maximum number of days to apply fine | `30` | No |
| `MAX_LOAN_DURATION` | Maximum duration for a book loan in days | `14` | No |
| `MAX_RENEWALS` | Maximum number of times a loan can be renewed | `2` | No |
| `RENEWAL_DURATION` | Duration of each loan renewal in days | `7` | No |
| `MAX_EVENT_CAPACITY` | Default maximum capacity for library events | `100` | No |
| `EVENT_REGISTRATION_DEADLINE` | Default registration deadline before event (hours) | `24` | No |
| `BACKUP_BUCKET` | S3 bucket name for database backups | - | No |
| `AWS_REGION` | AWS region for S3 bucket | - | No |
| `ENABLE_CDN` | Enable/disable Content Delivery Network | `false` | No |
| `CDN_PROVIDER` | CDN provider name (e.g., 'cloudfront') | `cloudfront` | No |
| `CDN_DOMAIN` | Domain name for CDN | - | No |
| `ENABLE_QUERY_CACHE` | Enable/disable database query caching | `false` | No |
| `QUERY_CACHE_TTL` | TTL for query cache in milliseconds | `300000` (5 mins) | No |
| `QUERY_CACHE_MAX_SIZE` | Max number of items in query cache | `1000` | No |
| `DB_POOL_MIN` | Minimum connections in DB pool | `5` | No |
| `DB_POOL_MAX` | Maximum connections in DB pool | `20` | No |
| `DB_POOL_IDLE_TIMEOUT` | DB pool idle connection timeout (ms) | `30000` | No |
| `ENABLE_API_CACHE` | Enable/disable API response caching | `false` | No |
| `API_CACHE_TTL` | TTL for API cache in milliseconds | `300000` (5 mins) | No |
| `ENABLE_LOAD_BALANCING` | Enable/disable load balancing features | `false` | No |
| `LB_ALGORITHM` | Load balancing algorithm | `round-robin` | No |
| `ENABLE_PERFORMANCE_MONITORING` | Enable/disable performance monitoring | `false` | No |
| `PERFORMANCE_SAMPLE_RATE` | Sampling rate for performance monitoring (0.0 to 1.0) | `0.1` | No |
| `MONITORING_PROVIDER` | Monitoring provider (e.g., 'grafana') | `grafana` | No |
| `SECRETS_STORAGE` | Secrets storage provider (e.g., 'vault') | `vault` | No |

## Environment-Specific Notes

### Development Environment
- Rate limiting is disabled by default
- CSRF protection is disabled by default
- Detailed error messages are enabled
- Uses local database and development email settings

### Production Environment
- All security features are enabled
- Detailed error messages are disabled
- Uses production database and email settings
- Stricter rate limits
- Longer monitoring intervals

### Testing Environment
- Uses test-specific database
- All features enabled for testing
- Short timeouts and intervals
- Mock email service

## Validation

Environment variables are validated using the `validate-env.js` script. Run it using:
```bash
node scripts/validate-env.js
```

The script checks:
1. Required variables are present
2. Variable values match expected patterns
3. Environment-specific requirements are met 