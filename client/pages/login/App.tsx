import { ConfigProvider, Spin } from 'antd'
import zh_CN from 'antd/locale/zh_CN'
import { Suspense } from 'react'
import { useLocation, useRoutes } from 'react-router'
import { useUser } from 'client/contexts/useUser'
import routes from '~react-page-login'
import './index.less'

function App() {
  const { pathname } = useLocation()
  const [{ themeConfig }] = useUser()
  return (
    <ConfigProvider locale={zh_CN} theme={{ token: { colorPrimary: themeConfig.color } }}>
      <Suspense fallback={<Spin spinning />}>
        <div key={pathname}>{useRoutes(routes)}</div>
      </Suspense>
    </ConfigProvider>
  )
}

export default App
