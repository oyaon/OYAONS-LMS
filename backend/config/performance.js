module.exports = {
  // CDN Configuration
  cdn: {
    enabled: process.env.ENABLE_CDN === 'true',
    provider: process.env.CDN_PROVIDER || 'cloudfront',
    domain: process.env.CDN_DOMAIN,
    ssl: true,
    cacheControl: {
      default: 'public, max-age=31536000',
      images: 'public, max-age=86400',
      scripts: 'public, max-age=604800',
      styles: 'public, max-age=604800'
    }
  },

  // Database Query Caching
  database: {
    queryCache: {
      enabled: process.env.ENABLE_QUERY_CACHE === 'true',
      ttl: process.env.QUERY_CACHE_TTL || 300000, // 5 minutes
      maxSize: process.env.QUERY_CACHE_MAX_SIZE || 1000,
      excludedQueries: [
        'user.*',
        'payment.*',
        'sensitive.*'
      ]
    },
    connectionPool: {
      min: process.env.DB_POOL_MIN || 5,
      max: process.env.DB_POOL_MAX || 20,
      idleTimeoutMillis: process.env.DB_POOL_IDLE_TIMEOUT || 30000
    },
    indexes: {
      books: ['title', 'author', 'isbn', 'category'],
      users: ['email', 'role'],
      loans: ['user', 'book', 'status']
    }
  },

  // API Response Caching
  api: {
    responseCache: {
      enabled: process.env.ENABLE_API_CACHE === 'true',
      ttl: process.env.API_CACHE_TTL || 300000, // 5 minutes
      excludedEndpoints: [
        '/api/auth/*',
        '/api/users/profile',
        '/api/payments/*'
      ],
      varyBy: ['Authorization', 'Accept-Language']
    },
    compression: {
      enabled: true,
      threshold: 1024, // 1KB
      level: 6
    },
    pagination: {
      defaultLimit: 10,
      maxLimit: 100,
      cursorBased: true
    }
  },

  // Load Balancing
  loadBalancer: {
    enabled: process.env.ENABLE_LOAD_BALANCING === 'true',
    algorithm: process.env.LB_ALGORITHM || 'round-robin',
    healthCheck: {
      interval: 30000,
      timeout: 5000,
      unhealthyThreshold: 2,
      healthyThreshold: 2
    },
    stickySessions: {
      enabled: true,
      cookieName: 'lb_session',
      ttl: 3600000 // 1 hour
    }
  },

  // Performance Monitoring
  monitoring: {
    enabled: process.env.ENABLE_PERFORMANCE_MONITORING === 'true',
    sampleRate: process.env.PERFORMANCE_SAMPLE_RATE || 0.1,
    metrics: {
      api: {
        responseTime: true,
        throughput: true,
        errorRate: true
      },
      database: {
        queryTime: true,
        connectionPool: true,
        cacheHitRate: true
      },
      system: {
        memory: true,
        cpu: true,
        disk: true
      }
    },
    dashboard: {
      enabled: true,
      provider: process.env.MONITORING_PROVIDER || 'grafana',
      updateInterval: 5000,
      retention: '30d'
    },
    alerts: {
      enabled: true,
      thresholds: {
        responseTime: 1000, // ms
        errorRate: 0.01, // 1%
        cpuUsage: 0.8, // 80%
        memoryUsage: 0.8 // 80%
      },
      channels: ['email', 'slack']
    }
  }
}; 