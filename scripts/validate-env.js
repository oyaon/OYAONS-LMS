const fs = require('fs');
const path = require('path');

// Project structure configuration
const projectConfig = {
  rootDir: process.cwd(),
  envFiles: {
    development: '.env.development',
    production: '.env.production',
    test: '.env.test'
  },
  // Add paths to check for environment files
  envPaths: [
    '.',  // Current directory
    '..', // Parent directory
    '../web', // Web directory
    '../backend' // Backend directory
  ]
};

// Required environment variables
const requiredVars = {
  common: [
    'VITE_REACT_APP_API_URL',
    'VITE_REACT_APP_API_TIMEOUT',
    'VITE_REACT_APP_ENABLE_RATE_LIMIT',
    'VITE_REACT_APP_ENABLE_CSRF',
    'VITE_REACT_APP_ENABLE_AUDIT_LOG',
    'VITE_REACT_APP_AUTH_TOKEN_KEY',
    'VITE_REACT_APP_AUTH_REFRESH_TOKEN_KEY',
    'VITE_REACT_APP_AUTH_TOKEN_EXPIRY',
  ],
  production: [
    'VITE_REACT_APP_DB_HOST',
    'VITE_REACT_APP_DB_PORT',
    'VITE_REACT_APP_DB_NAME',
    'VITE_REACT_APP_EMAIL_HOST',
    'VITE_REACT_APP_EMAIL_PORT',
    'VITE_REACT_APP_EMAIL_USER',
    'VITE_REACT_APP_EMAIL_PASSWORD',
    'MONGODB_URI',
    'JWT_SECRET',
    'EMAIL_USER',
    'EMAIL_PASS',
  ],
  test: [
    'VITE_REACT_APP_TEST_MODE',
    'VITE_REACT_APP_TEST_API_KEY',
    'VITE_REACT_APP_TEST_USER_ID',
    'VITE_REACT_APP_TEST_ADMIN_ID',
  ],
  backend_common: [ // New category for backend
    'CLIENT_URL',
    'JWT_EXPIRES_IN',
    'EMAIL_SERVICE',
    'EMAIL_FROM',
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'TWILIO_PHONE_NUMBER',
    'MAX_FILE_SIZE',
    'FINE_PER_DAY',
    'MAX_FINE_DAYS',
    'MAX_LOAN_DURATION',
    'MAX_RENEWALS',
    'RENEWAL_DURATION',
    'MAX_EVENT_CAPACITY',
    'EVENT_REGISTRATION_DEADLINE',
    'BACKUP_BUCKET',
    'AWS_REGION',
    'ENABLE_CDN',
    'CDN_PROVIDER',
    'CDN_DOMAIN',
    'ENABLE_QUERY_CACHE',
    'QUERY_CACHE_TTL',
    'QUERY_CACHE_MAX_SIZE',
    'DB_POOL_MIN',
    'DB_POOL_MAX',
    'DB_POOL_IDLE_TIMEOUT',
    'ENABLE_API_CACHE',
    'API_CACHE_TTL',
    'ENABLE_LOAD_BALANCING',
    'LB_ALGORITHM',
    'ENABLE_PERFORMANCE_MONITORING',
    'PERFORMANCE_SAMPLE_RATE',
    'MONITORING_PROVIDER',
    'SECRETS_STORAGE'
  ]
};

// Validation rules for configuration values
const validationRules = {
  // API Configuration
  API_URL: {
    required: true,
    type: 'string',
    pattern: /^https?:\/\/.+/,
    message: 'API_URL must be a valid URL starting with http:// or https://'
  },
  API_TIMEOUT: {
    required: true,
    type: 'number',
    min: 1000,
    max: 30000,
    message: 'API_TIMEOUT must be between 1000 and 30000 milliseconds'
  },

  // Security Features
  ENABLE_RATE_LIMIT: {
    required: true,
    type: 'boolean'
  },
  RATE_LIMIT_WINDOW: {
    required: true,
    type: 'number',
    min: 1000,
    message: 'RATE_LIMIT_WINDOW must be at least 1000 milliseconds'
  },
  RATE_LIMIT_MAX_REQUESTS: {
    required: true,
    type: 'number',
    min: 1,
    message: 'RATE_LIMIT_MAX_REQUESTS must be at least 1'
  },

  // Analytics Configuration
  ENABLE_ANALYTICS: {
    required: true,
    type: 'boolean'
  },
  ANALYTICS_ID: {
    required: (config) => config.ENABLE_ANALYTICS,
    type: 'string',
    pattern: /^UA-\d{4,10}-\d{1,4}$/,
    message: 'ANALYTICS_ID must be a valid Google Analytics ID'
  },

  // Performance Monitoring
  ENABLE_PERFORMANCE_MONITORING: {
    required: true,
    type: 'boolean'
  },
  PERFORMANCE_SAMPLE_RATE: {
    required: true,
    type: 'number',
    min: 0,
    max: 1,
    message: 'PERFORMANCE_SAMPLE_RATE must be between 0 and 1'
  },

  // Cache Configuration
  CACHE: {
    required: true,
    type: 'object',
    properties: {
      ENABLED: { type: 'boolean', required: true },
      TTL: { type: 'number', min: 0, required: true },
      STRATEGY: { type: 'string', enum: ['redis', 'memory'], required: true },
      REDIS_URL: { 
        required: (config) => config.STRATEGY === 'redis',
        type: 'string',
        pattern: /^redis:\/\/.+/,
        message: 'REDIS_URL must be a valid Redis URL'
      },
      MEMORY_LIMIT: { 
        required: (config) => config.STRATEGY === 'memory',
        type: 'number',
        min: 1024 * 1024, // 1MB
        message: 'MEMORY_LIMIT must be at least 1MB'
      }
    }
  },

  // Search Configuration
  SEARCH: {
    required: true,
    type: 'object',
    properties: {
      ENABLED: { type: 'boolean', required: true },
      PROVIDER: { type: 'string', enum: ['elasticsearch', 'local'], required: true },
      ELASTICSEARCH_URL: { 
        required: (config) => config.PROVIDER === 'elasticsearch',
        type: 'string',
        pattern: /^https?:\/\/.+/,
        message: 'ELASTICSEARCH_URL must be a valid URL'
      },
      INDEX_UPDATE_INTERVAL: { 
        type: 'number',
        min: 60000,
        message: 'INDEX_UPDATE_INTERVAL must be at least 60000 milliseconds'
      },
      BATCH_SIZE: { 
        type: 'number',
        min: 1,
        max: 10000,
        message: 'BATCH_SIZE must be between 1 and 10000'
      }
    }
  },

  // Security Configuration
  SECURITY: {
    required: true,
    type: 'object',
    properties: {
      ENABLE_2FA: { type: 'boolean', required: true },
      PASSWORD_POLICY: {
        type: 'object',
        required: true,
        properties: {
          MIN_LENGTH: { type: 'number', min: 8, required: true },
          REQUIRE_NUMBERS: { type: 'boolean', required: true },
          REQUIRE_SPECIAL_CHARS: { type: 'boolean', required: true },
          REQUIRE_UPPERCASE: { type: 'boolean', required: true },
          REQUIRE_LOWERCASE: { type: 'boolean', required: true }
        }
      },
      SESSION: {
        type: 'object',
        required: true,
        properties: {
          SECRET: { type: 'string', minLength: 32, required: true },
          EXPIRY: { 
            type: 'string',
            pattern: /^\d+[smhd]$/,
            message: 'SESSION.EXPIRY must be in format: number followed by s, m, h, or d'
          },
          COOKIE_SECURE: { type: 'boolean', required: true },
          COOKIE_HTTP_ONLY: { type: 'boolean', required: true }
        }
      }
    }
  },

  // Backend Variables
  CLIENT_URL: {
    required: false,
    type: 'string',
    pattern: /^https?:\/\/.+/,
    message: 'CLIENT_URL must be a valid URL'
  },
  MONGODB_URI: {
    required: (config, envType) => envType === 'production', // Required in prod
    type: 'string',
    pattern: /^mongodb(?:\+srv)?:\/\/.+/,
    message: 'MONGODB_URI must be a valid MongoDB connection string'
  },
  JWT_SECRET: {
    required: true,
    type: 'string',
    minLength: 32, // Enforce a minimum length for security
    message: 'JWT_SECRET is required and must be at least 32 characters long'
  },
  JWT_EXPIRES_IN: {
    required: false,
    type: 'string',
    pattern: /^\d+[smhd]$/, // e.g., 7d, 24h, 60m
    message: 'JWT_EXPIRES_IN must be a number followed by s, m, h, or d'
  },
  EMAIL_SERVICE: { required: false, type: 'string' },
  EMAIL_USER: { 
    required: (config, envType) => envType === 'production', // Required in prod
    type: 'string' 
  },
  EMAIL_PASS: { 
    required: (config, envType) => envType === 'production', // Required in prod
    type: 'string' 
  },
  EMAIL_FROM: { required: false, type: 'string' },
  TWILIO_ACCOUNT_SID: { required: false, type: 'string' },
  TWILIO_AUTH_TOKEN: { required: false, type: 'string' },
  TWILIO_PHONE_NUMBER: { required: false, type: 'string' },
  MAX_FILE_SIZE: { required: false, type: 'number', min: 1024 }, // Require at least 1KB
  FINE_PER_DAY: { required: false, type: 'number', min: 0 },
  MAX_FINE_DAYS: { required: false, type: 'number', min: 0 },
  MAX_LOAN_DURATION: { required: false, type: 'number', min: 1 },
  MAX_RENEWALS: { required: false, type: 'number', min: 0 },
  RENEWAL_DURATION: { required: false, type: 'number', min: 1 },
  MAX_EVENT_CAPACITY: { required: false, type: 'number', min: 1 },
  EVENT_REGISTRATION_DEADLINE: { required: false, type: 'number', min: 0 },
  BACKUP_BUCKET: { required: false, type: 'string' },
  AWS_REGION: { required: false, type: 'string' },
  ENABLE_CDN: { required: false, type: 'boolean' },
  CDN_PROVIDER: { required: false, type: 'string' },
  CDN_DOMAIN: { required: false, type: 'string' },
  ENABLE_QUERY_CACHE: { required: false, type: 'boolean' },
  QUERY_CACHE_TTL: { required: false, type: 'number', min: 0 },
  QUERY_CACHE_MAX_SIZE: { required: false, type: 'number', min: 0 },
  DB_POOL_MIN: { required: false, type: 'number', min: 0 },
  DB_POOL_MAX: { required: false, type: 'number', min: 1 },
  DB_POOL_IDLE_TIMEOUT: { required: false, type: 'number', min: 1000 },
  ENABLE_API_CACHE: { required: false, type: 'boolean' },
  API_CACHE_TTL: { required: false, type: 'number', min: 0 },
  ENABLE_LOAD_BALANCING: { required: false, type: 'boolean' },
  LB_ALGORITHM: { required: false, type: 'string' },
  ENABLE_PERFORMANCE_MONITORING: { required: false, type: 'boolean' },
  PERFORMANCE_SAMPLE_RATE: { required: false, type: 'number', min: 0, max: 1 },
  MONITORING_PROVIDER: { required: false, type: 'string' },
  SECRETS_STORAGE: { required: false, type: 'string' }
};

function findEnvFile(envFile) {
  for (const envPath of projectConfig.envPaths) {
    const fullPath = path.join(projectConfig.rootDir, envPath, envFile);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }
  return null;
}

function validateConfig(config, rules = validationRules, path = '', envType) {
  const errors = [];

  for (const [key, rule] of Object.entries(rules)) {
    const value = config[key];
    const currentPath = path ? `${path}.${key}` : key;

    // Check if required
    if (rule.required) {
      let isRequired = false;
      if (typeof rule.required === 'function') {
        isRequired = rule.required(config, envType);
      } else {
        isRequired = rule.required;
      }

      if (isRequired && value === undefined) {
        errors.push(`${currentPath} is required`);
        continue;
      }
    }

    // Check required based on envType for specific variables like MONGODB_URI
    if (key === 'MONGODB_URI' && envType === 'production' && value === undefined) {
      errors.push(`${currentPath} is required for production environment`);
      continue;
    }
    if (key === 'EMAIL_USER' && envType === 'production' && value === undefined) {
      errors.push(`${currentPath} is required for production environment`);
      continue;
    }
    if (key === 'EMAIL_PASS' && envType === 'production' && value === undefined) {
      errors.push(`${currentPath} is required for production environment`);
      continue;
    }

    if (value === undefined) continue;

    // Check type
    if (rule.type === 'boolean' && typeof value !== 'boolean') {
      if (typeof value === 'string' && (value.toLowerCase() === 'true' || value.toLowerCase() === 'false')) {
        config[key] = value.toLowerCase() === 'true';
      } else {
        errors.push(`${currentPath} must be of type boolean (true/false)`);
        continue;
      }
    } else if (rule.type && typeof value !== rule.type) {
      if (rule.type === 'number' && typeof value === 'string' && !isNaN(parseFloat(value))) {
        config[key] = parseFloat(value);
      } else {
        errors.push(`${currentPath} must be of type ${rule.type}`);
        continue;
      }
    }

    // Check pattern
    if (rule.pattern && !rule.pattern.test(value)) {
      errors.push(rule.message || `${currentPath} does not match required pattern`);
      continue;
    }

    // Check min/max for numbers
    if (rule.type === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        errors.push(rule.message || `${currentPath} must be at least ${rule.min}`);
      }
      if (rule.max !== undefined && value > rule.max) {
        errors.push(rule.message || `${currentPath} must be at most ${rule.max}`);
      }
    }

    // Check enum values
    if (rule.enum && !rule.enum.includes(value)) {
      errors.push(`${currentPath} must be one of: ${rule.enum.join(', ')}`);
    }

    // Recursively validate nested objects
    if (rule.type === 'object' && rule.properties) {
      errors.push(...validateConfig(value, rule.properties, currentPath, envType));
    }
  }

  return errors;
}

function validateEnvironment(envType) {
  console.log(`Validating environment: ${envType}`);
  const envFileName = projectConfig.envFiles[envType];
  if (!envFileName) {
    console.error(`Error: Unknown environment type '${envType}'`);
    process.exit(1);
  }

  const envFilePath = findEnvFile(envFileName);
  if (!envFilePath) {
    console.warn(`Warning: Environment file '${envFileName}' not found.`);
    return;
  }

  const dotenv = require('dotenv');
  const envConfig = dotenv.config({ path: envFilePath }).parsed || {};

  let combinedRequired = [...(requiredVars.common || [])];
  if (requiredVars[envType]) {
    combinedRequired = [...combinedRequired, ...requiredVars[envType]];
  }
  if (requiredVars.backend_common) {
    combinedRequired = [...combinedRequired, ...requiredVars.backend_common];
  }

  const missingVars = combinedRequired.filter(v => !(v in envConfig));
  if (missingVars.length > 0) {
    console.error(`Error: Missing required environment variables for ${envType}:`);
    missingVars.forEach(v => console.error(`- ${v}`));
  }
  
  const validationErrors = validateConfig(envConfig, validationRules, '', envType);

  if (validationErrors.length > 0) {
    console.error(`Error: Environment variable validation failed for ${envType}:`);
    validationErrors.forEach(err => console.error(`- ${err}`));
    process.exit(1);
  } else {
    console.log(`Environment '${envType}' validation successful.`);
  }
}

if (require.main === module) {
  const envArg = process.argv[2];
  if (!envArg) {
    console.error('Usage: node validate-env.js <environment_type>');
    console.error('Example: node validate-env.js development');
    process.exit(1);
  }
  
  const currentEnvType = envArg; 

  if (!projectConfig.envFiles[currentEnvType]) {
    console.error(`Error: Invalid environment type '${currentEnvType}'. Valid types: ${Object.keys(projectConfig.envFiles).join(', ')}`);
    process.exit(1);
  }

  validateEnvironment(currentEnvType);
}

module.exports = { validateEnvironment, findEnvFile }; 