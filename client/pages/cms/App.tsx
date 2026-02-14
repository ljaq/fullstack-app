import { ConfigProvider } from 'antd'
import Skeleton from './Skeleton'
import zh_CN from 'antd/locale/zh_CN'
import Translate from 'client/components/Animation/Translate'
import { useUser } from 'client/contexts/useUser'
import EasyModal from 'client/utils/easyModal'
import { lazy, Suspense, useEffect } from 'react'
import { useLocation, useRoutes } from 'react-router'
import cmsRoutes from '~react-page-cms'
import { useAuthorityRoutes } from 'client/hooks/useAuthorityRoutes'
import Layout from './components/Layout/index'

const NotFound = lazy(() => import('client/pages/404/routes/index'))

const routes = [
  ...cmsRoutes,
  {
    path: '/*',
    element: <NotFound crossPage={false} />,
  },
]
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
          <Suspense fallback={<Skeleton />}>
            <Translate distance={40}>
              <div key={pathname} style={{ padding: '0 40px 32px' }}>
                {useRoutes(useAuthorityRoutes(routes))}
              </div>
            </Translate>
          </Suspense>
        </Layout>
      </EasyModal.Provider>
    </ConfigProvider>
  )
}

export default App
