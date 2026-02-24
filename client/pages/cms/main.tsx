import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import UserProvider from 'client/contexts/useUser'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'

const queryClient = new QueryClient()

if (import.meta.env.DEV) {
  const { ReactQueryDevtools } = await import('@tanstack/react-query-devtools')
  createRoot(document.getElementById('root')!).render(
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <App />
      </UserProvider>
      <ReactQueryDevtools />
    </QueryClientProvider>,
  )
} else {
  createRoot(document.getElementById('root')!).render(
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <App />
      </UserProvider>
    </QueryClientProvider>,
  )
}
