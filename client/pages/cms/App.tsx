import { Suspense } from 'react'
import { useLocation, useRoutes } from 'react-router'
import routes from '~react-page-cms'
import Layout from '../../components/layout copy'
import { Spin, ConfigProvider } from 'antd'
import zh_CN from 'antd/locale/zh_CN'
import EasyModal from '../../utils/easyModal'
import Translate from '../../components/Animation/Translate'
function App() {
  const { pathname } = useLocation()
  return (
    <ConfigProvider locale={zh_CN}>
      <EasyModal.Provider>
        <Layout>
          <Suspense fallback={<Spin spinning />}>
            <Translate distance={40}>
              <div key={pathname}>{useRoutes(routes)}</div>
            </Translate>
          </Suspense>
        </Layout>
      </EasyModal.Provider>
    </ConfigProvider>
  )
}

export default App
