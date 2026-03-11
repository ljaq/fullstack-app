import { ConfigProvider } from 'antd'
import Skeleton from './Skeleton'
import zh_CN from 'antd/locale/zh_CN'
import { Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router'
import routes from 'client/pages/404/routes/_route.gen'
import { themeToken } from 'client/utils/theme'

function App() {
  return (
    <ConfigProvider locale={zh_CN} theme={themeToken}>
      <Suspense fallback={<Skeleton />}>
        <RouterProvider router={createBrowserRouter(routes)} />
      </Suspense>
    </ConfigProvider>
  )
}

export default App
