import { ConfigProvider, Spin } from 'antd'
import zh_CN from 'antd/locale/zh_CN'
import { Suspense } from 'react'
import { useLocation, useRoutes } from 'react-router'
import { useUser } from 'client/contexts/useUser'
import EasyModal from 'client/utils/easyModal'
import routes from '~react-page-{{pageName}}'
import './index.less'

function App() {
  const { pathname } = useLocation()
  const [{ themeConfig }] = useUser()
  
  return (
    <ConfigProvider locale={zh_CN} theme=<%-"{{ token: { colorPrimary: themeConfig.color } }}"%>>
      <EasyModal.Provider>
        <Suspense fallback={<Spin spinning />}>
          <div key={pathname}>{useRoutes(routes)}</div>
        </Suspense>
      </EasyModal.Provider>
    </ConfigProvider>
  )
}

export default App
