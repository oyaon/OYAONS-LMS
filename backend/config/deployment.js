module.exports = {
  // Health Checks
  health: {
    enabled: true,
    endpoints: {
      liveness: '/health/live',
      readiness: '/health/ready',
      startup: '/health/start'
    },
    checks: {
      database: {
        enabled: true,
        interval: 30000,
        timeout: 5000
      },
      redis: {
        enabled: true,
        interval: 30000,
        timeout: 5000
      },
      memory: {
        enabled: true,
        threshold: 0.8, // 80%
        interval: 60000
      }
    },
    reporting: {
      format: 'json',
      channels: ['prometheus', 'datadog']
    }
  },

  // Rolling Updates
  updates: {
    strategy: 'rolling',
    config: {
      maxUnavailable: 1,
      maxSurge: 1,
      minReadySeconds: 30,
      progressDeadlineSeconds: 600
    },
    hooks: {
      preUpdate: {
        enabled: true,
        script: './scripts/pre-update.sh'
      },
      postUpdate: {
        enabled: true,
        script: './scripts/post-update.sh'
      }
    }
  },

  // Backup Strategy
  backup: {
    enabled: true,
    schedule: '0 0 * * *', // Daily at midnight
    retention: {
      daily: 7,
      weekly: 4,
      monthly: 12
    },
    storage: {
      type: 's3',
      bucket: process.env.BACKUP_BUCKET,
      region: process.env.AWS_REGION,
      prefix: 'backups/'
    },
    encryption: {
      enabled: true,
      algorithm: 'aes-256-gcm'
    },
    verification: {
      enabled: true,
      interval: '7d'
    }
  },

  // Monitoring Dashboard
  monitoring: {
    enabled: true,
    provider: 'grafana',
    dashboards: {
      system: {
        enabled: true,
        refresh: '5s',
        panels: ['cpu', 'memory', 'disk', 'network']
      },
      application: {
        enabled: true,
        refresh: '10s',
        panels: ['requests', 'errors', 'latency', 'throughput']
      },
      business: {
        enabled: true,
        refresh: '1m',
        panels: ['users', 'books', 'loans', 'payments']
      }
    },
    alerts: {
      enabled: true,
      channels: ['email', 'slack', 'pagerduty'],
      rules: {
        critical: {
          threshold: 0.01, // 1%
          duration: '5m'
        },
        warning: {
          threshold: 0.05, // 5%
          duration: '15m'
        }
      }
    }
  },

  // Logging Aggregation
  logging: {
    enabled: true,
    provider: 'elasticsearch',
    config: {
      index: 'library-logs',
      retention: '30d',
      shards: 3,
      replicas: 1
    },
    format: {
      type: 'json',
      timestamp: true,
      level: true,
      context: true
    },
    transport: {
      type: 'file',
      filename: 'combined.log',
      maxSize: '100m',
      maxFiles: '14d'
    },
    filters: {
      sensitive: {
        enabled: true,
        patterns: [
          'password',
          'token',
          'secret',
          'key'
        ]
      }
    }
  }
}; 