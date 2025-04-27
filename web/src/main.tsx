import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { setupErrorHandling } from './lib/error-handling'
import { getCsrfToken } from './lib/security'
import { useCache } from './lib/cache'
import { logAuditEvent } from './lib/security'

// Initialize error handling
setupErrorHandling()

// Initialize security features
if (import.meta.env.VITE_REACT_APP_ENABLE_CSRF === 'true') {
  getCsrfToken()
}

// Initialize performance monitoring
if (import.meta.env.VITE_REACT_APP_ENABLE_PERFORMANCE_MONITORING === 'true') {
  // Log performance metrics
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      logAuditEvent({
        action: 'PERFORMANCE_METRIC',
        details: {
          name: entry.name,
          duration: entry.duration,
          type: entry.entryType,
        },
      })
    }
  })

  observer.observe({ entryTypes: ['measure', 'resource'] })
}

// Create query client with caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: import.meta.env.VITE_REACT_APP_CACHE_TTL
        ? parseInt(import.meta.env.VITE_REACT_APP_CACHE_TTL)
        : 300000,
      cacheTime: import.meta.env.VITE_REACT_APP_CACHE_TTL
        ? parseInt(import.meta.env.VITE_REACT_APP_CACHE_TTL)
        : 300000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// Initialize cache
if (import.meta.env.VITE_REACT_APP_ENABLE_CACHE === 'true') {
  const cache = useCache.getState()
  cache.set('initialized', true)
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
) 