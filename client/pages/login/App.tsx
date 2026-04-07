import { ConfigProvider, App as AntdApp } from 'antd'
import Skeleton from './Skeleton'
import zh_CN from 'antd/locale/zh_CN'
import { Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router'
import routes from 'client/pages/login/routes/_route.gen'
import RoseCurveLoading from 'client/components/RoseCurveLoading'
import { themeToken } from 'client/utils/theme'
import './index.less'

function App() {
  return (
    <ConfigProvider locale={zh_CN} theme={themeToken} spin={{ indicator: <RoseCurveLoading /> }}>
      <AntdApp>
        <Suspense fallback={<Skeleton />}>
          <RouterProvider router={createBrowserRouter(routes)} />
        </Suspense>
      </AntdApp>
    </ConfigProvider>
  )
}

export default App
