import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary'
import './index.css'
import App from './App.tsx'

function Fallback({ error }: FallbackProps) {
  return (
    <div role="alert" style={{ padding: '2rem', color: 'red' }}>
      <p>Something went wrong:</p>
      <pre style={{ color: 'red' }}>{error instanceof Error ? error.message : String(error)}</pre>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary FallbackComponent={Fallback}>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
