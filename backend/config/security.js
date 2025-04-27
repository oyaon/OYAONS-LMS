module.exports = {
  // Secrets Management
  secrets: {
    storage: process.env.SECRETS_STORAGE || 'vault',
    rotation: {
      enabled: true,
      interval: '7d',
      gracePeriod: '24h'
    },
    encryption: {
      algorithm: 'aes-256-gcm',
      keyRotation: true
    }
  },

  // Rate Limiting
  rateLimit: {
    enabled: true,
    windowMs: 60000,
    max: 100,
    ipBased: {
      enabled: true,
      max: 50,
      blockDuration: 3600000 // 1 hour
    },
    userBased: {
      enabled: true,
      max: 200,
      blockDuration: 1800000 // 30 minutes
    },
    routes: {
      '/api/auth/login': {
        max: 5,
        windowMs: 300000 // 5 minutes
      },
      '/api/auth/register': {
        max: 3,
        windowMs: 3600000 // 1 hour
      }
    }
  },

  // Request Validation
  validation: {
    enabled: true,
    sanitization: {
      enabled: true,
      rules: {
        xss: true,
        sqlInjection: true,
        noSqlInjection: true
      }
    },
    schema: {
      strict: true,
      coerceTypes: true,
      removeAdditional: true
    }
  },

  // Security Headers
  headers: {
    enabled: true,
    csp: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    xss: true,
    frameOptions: 'DENY',
    contentType: 'nosniff',
    referrerPolicy: 'strict-origin-when-cross-origin'
  },

  // Security Scanning
  scanning: {
    enabled: true,
    schedule: '0 0 * * *', // Daily at midnight
    tools: {
      dependency: {
        enabled: true,
        provider: 'snyk',
        criticalThreshold: 0
      },
      code: {
        enabled: true,
        provider: 'sonarqube',
        rules: {
          security: 'critical',
          reliability: 'major',
          maintainability: 'major'
        }
      },
      container: {
        enabled: true,
        provider: 'trivy',
        severity: 'HIGH'
      }
    },
    reporting: {
      format: 'html',
      channels: ['email', 'slack'],
      recipients: ['security-team@example.com']
    }
  },

  // Audit Logging
  audit: {
    enabled: true,
    level: 'info',
    format: 'json',
    transport: {
      type: 'file',
      filename: 'audit.log',
      maxSize: '100m',
      maxFiles: '14d'
    },
    events: {
      auth: true,
      data: true,
      system: true,
      security: true
    },
    retention: '30d'
  }
}; 