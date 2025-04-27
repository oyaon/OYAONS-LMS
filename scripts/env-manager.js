const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Project structure configuration
const projectConfig = {
  rootDir: process.cwd(),
  configDirs: {
    web: 'web/config',
    backend: 'backend/config'
  },
  envTypes: ['development', 'production', 'test', 'staging', 'qa', 'preview']
};

function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getWebConfig(envType) {
  const configs = {
    development: {
      apiUrl: 'http://localhost:5000',
      dbPort: 27017,
      emailPort: 587,
      rateLimit: false,
      csrf: false,
      showErrors: true,
      analytics: false,
      performance: false
    },
    production: {
      apiUrl: 'https://api.your-library.com',
      dbPort: 27017,
      emailPort: 587,
      rateLimit: true,
      csrf: true,
      showErrors: false,
      analytics: true,
      performance: true
    },
    test: {
      apiUrl: 'http://localhost:5001',
      dbPort: 27018,
      emailPort: 2525,
      rateLimit: false,
      csrf: false,
      showErrors: true,
      analytics: false,
      performance: false
    },
    staging: {
      apiUrl: 'https://staging-api.your-library.com',
      dbPort: 27017,
      emailPort: 587,
      rateLimit: true,
      csrf: true,
      showErrors: true,
      analytics: true,
      performance: true
    },
    qa: {
      apiUrl: 'https://qa-api.your-library.com',
      dbPort: 27017,
      emailPort: 587,
      rateLimit: true,
      csrf: true,
      showErrors: true,
      analytics: true,
      performance: true
    },
    preview: {
      apiUrl: 'https://preview-api.your-library.com',
      dbPort: 27017,
      emailPort: 587,
      rateLimit: true,
      csrf: true,
      showErrors: true,
      analytics: true,
      performance: true
    }
  };

  const config = configs[envType];
  return {
    // API Configuration
    API_URL: config.apiUrl,
    API_TIMEOUT: 10000,

    // Security Features
    ENABLE_RATE_LIMIT: config.rateLimit,
    RATE_LIMIT_WINDOW: 60000,
    RATE_LIMIT_MAX_REQUESTS: 100,

    ENABLE_CSRF: config.csrf,
    CSRF_TOKEN_HEADER: 'X-CSRF-Token',

    ENABLE_AUDIT_LOG: true,
    AUDIT_LOG_LEVEL: envType === 'production' ? 'info' : 'debug',

    // Authentication
    AUTH_TOKEN_KEY: `${envType}_auth_token`,
    AUTH_REFRESH_TOKEN_KEY: `${envType}_refresh_token`,
    AUTH_TOKEN_EXPIRY: 3600,

    // Feature Flags
    ENABLE_EXPORT: true,
    ENABLE_BULK_ACTIONS: true,
    ENABLE_ADVANCED_FILTERS: true,

    // Pagination
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,

    // Error Handling
    SHOW_ERROR_DETAILS: config.showErrors,
    ERROR_MESSAGE_DURATION: 5000,

    // Database Configuration
    DB_HOST: 'localhost',
    DB_PORT: config.dbPort,
    DB_NAME: `library_${envType}`,

    // Email Configuration
    EMAIL_HOST: `smtp.${envType}.com`,
    EMAIL_PORT: config.emailPort,
    EMAIL_USER: `${envType}@example.com`,
    EMAIL_PASSWORD: `${envType}_password`,

    // File Upload Configuration
    MAX_FILE_SIZE: 5242880,
    ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'application/pdf'],

    // Cache Configuration
    CACHE_ENABLED: true,
    CACHE_TTL: 3600,

    // Monitoring
    ENABLE_MONITORING: true,
    MONITORING_INTERVAL: 300000,

    // Analytics Configuration
    ENABLE_ANALYTICS: config.analytics,
    ANALYTICS_ID: config.analytics ? 'UA-XXXXXXXXX-X' : '',
    ANALYTICS_DEBUG: envType === 'development',

    // Performance Monitoring
    ENABLE_PERFORMANCE_MONITORING: config.performance,
    PERFORMANCE_SAMPLE_RATE: envType === 'production' ? 0.1 : 1.0,

    // Error Tracking
    ENABLE_ERROR_TRACKING: config.performance,
    ERROR_TRACKING_SAMPLE_RATE: envType === 'production' ? 0.1 : 1.0,

    // Feature Flags
    FEATURES: {
      ENABLE_REGISTRATION: true,
      ENABLE_PASSWORD_RESET: true,
      ENABLE_EMAIL_VERIFICATION: true,
      ENABLE_OAUTH: envType === 'production',
      ENABLE_2FA: envType === 'production',
      ENABLE_ANALYTICS: config.analytics,
      ENABLE_PERFORMANCE_MONITORING: config.performance,
      ENABLE_ERROR_TRACKING: config.performance,
      ENABLE_AUTOMATED_TESTING: envType === 'test' || envType === 'qa',
      ENABLE_LOAD_TESTING: envType === 'staging' || envType === 'qa',
      ENABLE_SECURITY_SCANNING: envType === 'staging' || envType === 'qa'
    },

    // Cache Configuration
    CACHE: {
      ENABLED: true,
      TTL: 3600,
      STRATEGY: envType === 'production' ? 'redis' : 'memory',
      REDIS_URL: 'redis://localhost:6379',
      MEMORY_LIMIT: 100 * 1024 * 1024 // 100MB
    },

    // Search Configuration
    SEARCH: {
      ENABLED: true,
      PROVIDER: envType === 'production' ? 'elasticsearch' : 'local',
      ELASTICSEARCH_URL: 'http://localhost:9200',
      INDEX_UPDATE_INTERVAL: 300000,
      BATCH_SIZE: 1000
    },

    // Notification Configuration
    NOTIFICATIONS: {
      ENABLED: true,
      PROVIDERS: ['email', 'in-app', 'push'],
      PUSH_NOTIFICATIONS: envType === 'production',
      EMAIL_TEMPLATES_DIR: './templates/email',
      PUSH_SERVICE_KEY: envType === 'production' ? 'your-push-service-key' : ''
    },

    // Backup Configuration
    BACKUP: {
      ENABLED: envType === 'production',
      STRATEGY: 'daily',
      SCHEDULE: '0 0 * * *',
      STORAGE: 's3',
      S3_BUCKET: 'your-backup-bucket',
      RETENTION_DAYS: 30
    },

    // Security Configuration
    SECURITY: {
      ENABLE_2FA: envType === 'production',
      PASSWORD_POLICY: {
        MIN_LENGTH: 8,
        REQUIRE_NUMBERS: true,
        REQUIRE_SPECIAL_CHARS: true,
        REQUIRE_UPPERCASE: true,
        REQUIRE_LOWERCASE: true
      },
      SESSION: {
        SECRET: `${envType}_session_secret`,
        EXPIRY: '24h',
        COOKIE_SECURE: envType === 'production',
        COOKIE_HTTP_ONLY: true
      }
    },

    ...(envType === 'test' && {
      // Test-Specific Configuration
      TEST_MODE: true,
      TEST_API_KEY: 'test-api-key',
      TEST_USER_ID: 'test-user-id',
      TEST_ADMIN_ID: 'test-admin-id',
      MOCK_API_DELAY: 100,
      TEST_DATA_DIR: './test-data'
    })
  };
}

function getBackendConfig(envType) {
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
  return {
    // Server Configuration
    PORT: config.port,
    NODE_ENV: envType,

    // Database Configuration
    MONGODB_URI: `mongodb://localhost:${config.mongoPort}/library_${envType}`,
    
    // JWT Configuration
    JWT_SECRET: `${envType}_jwt_secret`,
    JWT_EXPIRY: '1h',
    REFRESH_TOKEN_SECRET: `${envType}_refresh_secret`,
    REFRESH_TOKEN_EXPIRY: '7d',

    // Security
    CORS_ORIGIN: 'http://localhost:3000',
    RATE_LIMIT: {
      windowMs: 60000,
      max: 100
    },
    ENABLE_CSRF: config.csrf,

    // Email Configuration
    SMTP_HOST: `smtp.${envType}.com`,
    SMTP_PORT: config.emailPort,
    SMTP_USER: `${envType}@example.com`,
    SMTP_PASS: `${envType}_password`,
    EMAIL_FROM: 'noreply@library.com',

    // Logging
    LOG_LEVEL: envType === 'production' ? 'info' : 'debug',
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
    SESSION_SECRET: `${envType}_session_secret`,
    SESSION_EXPIRY: '24h',

    // API Limits
    MAX_ITEMS_PER_PAGE: 100,
    DEFAULT_ITEMS_PER_PAGE: 10,

    // Feature Flags
    FEATURES: {
      ENABLE_REGISTRATION: true,
      ENABLE_PASSWORD_RESET: true,
      ENABLE_EMAIL_VERIFICATION: true,
      ENABLE_OAUTH: envType === 'production',
      ENABLE_2FA: envType === 'production'
    },

    // Monitoring
    ENABLE_MONITORING: true,
    MONITORING_INTERVAL: 300000,

    // Backup Configuration
    BACKUP_ENABLED: envType === 'production',
    BACKUP_INTERVAL: '0 0 * * *', // Daily at midnight
    BACKUP_DIR: './backups',
    
    // Notification Configuration
    ENABLE_NOTIFICATIONS: true,
    NOTIFICATION_TYPES: ['email', 'in-app'],
    
    // Search Configuration
    ENABLE_FULL_TEXT_SEARCH: true,
    SEARCH_INDEX_UPDATE_INTERVAL: 300000, // 5 minutes

    ...(envType === 'test' && {
      // Test-Specific Configuration
      TEST_MODE: true,
      TEST_API_KEY: 'test-api-key',
      TEST_USER_ID: 'test-user-id',
      TEST_ADMIN_ID: 'test-admin-id',
      MOCK_API_DELAY: 100,
      TEST_DATA_DIR: './test-data'
    })
  };
}

function createEnvFile(envType) {
  // Create web environment configuration
  const webConfigDir = path.join(projectConfig.rootDir, projectConfig.configDirs.web);
  ensureDirectoryExists(webConfigDir);
  
  const webConfigPath = path.join(webConfigDir, `env.${envType}.js`);
  const webConfig = `module.exports = ${JSON.stringify(getWebConfig(envType), null, 2)};`;
  fs.writeFileSync(webConfigPath, webConfig);
  console.log(`Created web environment config: ${webConfigPath}`);

  // Create backend environment configuration
  const backendConfigDir = path.join(projectConfig.rootDir, projectConfig.configDirs.backend);
  ensureDirectoryExists(backendConfigDir);
  
  const backendConfigPath = path.join(backendConfigDir, `env.${envType}.js`);
  const backendConfig = `module.exports = ${JSON.stringify(getBackendConfig(envType), null, 2)};`;
  fs.writeFileSync(backendConfigPath, backendConfig);
  console.log(`Created backend environment config: ${backendConfigPath}`);

  // Create .env files with basic configuration
  const webEnvPath = path.join(projectConfig.rootDir, 'web', '.env');
  const backendEnvPath = path.join(projectConfig.rootDir, 'backend', '.env');

  const envContent = `NODE_ENV=${envType}
VITE_APP_ENV=${envType}`;

  fs.writeFileSync(webEnvPath, envContent);
  fs.writeFileSync(backendEnvPath, envContent);
  
  console.log(`Created .env files for ${envType} environment`);
}

function switchEnvironment(envType) {
  console.log(`Switching to ${envType} environment...`);
  
  // Create environment configurations if they don't exist
  createEnvFile(envType);
  
  // Update .env files to point to the correct environment
  const webEnvPath = path.join(projectConfig.rootDir, 'web', '.env');
  const backendEnvPath = path.join(projectConfig.rootDir, 'backend', '.env');

  const envContent = `NODE_ENV=${envType}
VITE_APP_ENV=${envType}`;

  fs.writeFileSync(webEnvPath, envContent);
  fs.writeFileSync(backendEnvPath, envContent);
  
  console.log(`Environment switched to ${envType}`);
}

function showMenu() {
  console.log('\nEnvironment Manager');
  console.log('1. Create Development Environment');
  console.log('2. Create Production Environment');
  console.log('3. Create Test Environment');
  console.log('4. Create Staging Environment');
  console.log('5. Create QA Environment');
  console.log('6. Create Preview Environment');
  console.log('7. Switch to Development Environment');
  console.log('8. Switch to Production Environment');
  console.log('9. Switch to Test Environment');
  console.log('10. Switch to Staging Environment');
  console.log('11. Switch to QA Environment');
  console.log('12. Switch to Preview Environment');
  console.log('13. Validate All Environments');
  console.log('14. Exit');

  rl.question('\nSelect an option (1-14): ', (answer) => {
    const envTypes = {
      '1': 'development',
      '2': 'production',
      '3': 'test',
      '4': 'staging',
      '5': 'qa',
      '6': 'preview'
    };

    if (answer >= '1' && answer <= '6') {
      createEnvFile(envTypes[answer]);
      showMenu();
    } else if (answer >= '7' && answer <= '12') {
      switchEnvironment(envTypes[answer - 6]);
      showMenu();
    } else if (answer === '13') {
      require('./validate-env.js');
      showMenu();
    } else if (answer === '14') {
      rl.close();
    } else {
      console.log('Invalid option. Please try again.');
      showMenu();
    }
  });
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.length > 0) {
  const envType = args[0].toLowerCase();
  if (['development', 'production', 'test'].includes(envType)) {
    switchEnvironment(envType);
    process.exit(0);
  } else {
    console.error('Invalid environment type. Use: development, production, or test');
    process.exit(1);
  }
} else {
  // Start the environment manager
  showMenu();
} 