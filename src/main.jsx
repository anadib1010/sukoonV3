import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import posthog from 'posthog-js'

// ─── POSTHOG INIT ─────────────────────────────────────────────────────
posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
  api_host: 'https://app.posthog.com',
  autocapture: false,          // We track manually — no noise
  capture_pageview: false,     // We track page views via setTab in App.jsx
  capture_pageleave: true,     // Track when users leave
  persistence: 'localStorage', // Works without cookies
  loaded: (ph) => {
    if (import.meta.env.DEV) ph.opt_out_capturing(); // No tracking in dev
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
