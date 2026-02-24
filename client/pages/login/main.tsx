import { createRoot } from 'react-dom/client'
import UserProvider from 'client/contexts/useUser'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <UserProvider>
    <App />
  </UserProvider>,
)
