import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { useAuthStore } from './stores/authStore'
import { useSessionStore } from './stores/sessionStore'
import './index.css'
import App from './App.tsx'

// Initialize auth on app startup to fetch fresh user data
useAuthStore.getState().initializeAuth();

// Sync sessions from cloud if user is already authenticated
// (Handles case where auth state is restored from localStorage before INITIAL_SESSION fires)
setTimeout(() => {
  const { isAuthenticated, accessToken } = useAuthStore.getState();
  if (isAuthenticated() && accessToken) {
    useSessionStore.getState().syncWithCloud();
  }
}, 1000); // Delay to allow auth initialization to complete

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
