import { ConfigProvider, Spin } from 'antd'
import zh_CN from 'antd/locale/zh_CN'
import { useUser } from 'client/contexts/useUser'
import { Suspense } from 'react'
import { useLocation, useRoutes } from 'react-router'
import routes from '~react-page-404'

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
