import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/theme.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router'
import { AuthProvider } from './AuthProvider.tsx'
import { SocketProvider } from './SocketProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  </StrictMode>,
)
