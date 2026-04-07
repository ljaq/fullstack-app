import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import UserProvider from 'client/contexts/useUser'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

dayjs.locale('zh-cn')

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
