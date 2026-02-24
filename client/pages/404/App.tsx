import { ConfigProvider } from 'antd'
import Skeleton from './Skeleton'
import zh_CN from 'antd/locale/zh_CN'
import { useUser } from 'client/contexts/useUser'
import { Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router'
import routes from '~react-page-404'

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
