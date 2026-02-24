import { ConfigProvider } from 'antd'
import Skeleton from './Skeleton'
import zh_CN from 'antd/locale/zh_CN'
import { Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { useUser } from 'client/contexts/useUser'
import routes from '~react-page-login'
import './index.less'

function App() {
  const [{ themeConfig }] = useUser()
  return (
    <ConfigProvider locale={zh_CN} theme={{ token: { colorPrimary: themeConfig.color } }}>
      <Suspense fallback={<Skeleton />}>
        <RouterProvider router={createBrowserRouter(routes)} />
      </Suspense>
    </ConfigProvider>
  )
}

export default App
