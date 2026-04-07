import { createRoot } from 'react-dom/client'
import UserProvider from 'client/contexts/useUser'
import App from './App.tsx'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

dayjs.locale('zh-cn')

createRoot(document.getElementById('root')!).render(
  <UserProvider>
    <App />
  </UserProvider>,
)
