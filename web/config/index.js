const development = require('./env.development');

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
  const envKey = `VITE_REACT_APP_${key}`;
  if (process.env[envKey]) {
    config[key] = process.env[envKey];
  }
});

module.exports = config; 