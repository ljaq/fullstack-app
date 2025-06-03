import { ConfigProvider, Spin } from 'antd'
import zh_CN from 'antd/locale/zh_CN'
import Translate from 'client/components/Animation/Translate'
import { useUser } from 'client/contexts/useUser'
import EasyModal from 'client/utils/easyModal'
import { Suspense, useEffect } from 'react'
import { useLocation, useRoutes } from 'react-router'
import routes from '~react-page-cms'
import Layout from './components/Layout/index'
function App() {
  const { pathname } = useLocation()
  const [{ themeConfig }, { getUser }] = useUser()

  useEffect(() => {
    getUser()
  }, [])
  return (
    <ConfigProvider locale={zh_CN} theme={{ token: { colorPrimary: themeConfig.color } }}>
      <EasyModal.Provider>
        <Layout>
          <Suspense fallback={<Spin spinning />}>
            <Translate distance={40}>
              <div
                key={pathname}
                style={{ height: 'calc(100vh - 56px)', padding: '0 40px 32px', boxSizing: 'border-box' }}
              >
                {useRoutes(routes)}
              </div>
            </Translate>
          </Suspense>
        </Layout>
      </EasyModal.Provider>
    </ConfigProvider>
  )
}

export default App
