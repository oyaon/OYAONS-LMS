const dotenv = require('dotenv');
const path = require('path');
const development = require('./env.development');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const env = process.env.NODE_ENV || 'development';

const configs = {
  development,
  // Add production and test configurations when needed
};

const config = configs[env];

if (!config) {
  throw new Error(`No configuration found for environment: ${env}`);
}

// Add environment variable overrides
Object.keys(config).forEach(key => {
  if (process.env[key]) {
    // Handle nested objects
    if (typeof config[key] === 'object' && !Array.isArray(config[key])) {
      config[key] = {
        ...config[key],
        ...JSON.parse(process.env[key] || '{}')
      };
    } else {
      // Convert environment variables to appropriate types
      const value = process.env[key];
      config[key] = value === 'true' ? true :
                    value === 'false' ? false :
                    !isNaN(value) ? Number(value) :
                    value;
    }
  }
});

module.exports = config; 