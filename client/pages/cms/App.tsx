import { ConfigProvider } from 'antd'
import zh_CN from 'antd/locale/zh_CN'
import { useUser } from 'client/contexts/useUser'
import EasyModal from 'client/utils/easyModal'
import { lazy, useEffect, useMemo } from 'react'
import { createBrowserRouter, RouteObject, RouterProvider } from 'react-router'
import cmsRoutes from '~react-page-cms'
import { useAuthorityRoutes } from 'client/hooks/useAuthorityRoutes'
import Layout from './components/Layout/index'

const NotFound = lazy(() => import('client/pages/404/routes/index'))

const routes = [
  {
    ...cmsRoutes[0],
    element: <Layout />,
    children: [
      ...(cmsRoutes[0]?.children || []),
      {
        path: '*',
        element: <NotFound crossPage={false} />,
      },
    ],
  },
] as RouteObject[]

function App() {
  const [{ themeConfig }, { getUser }] = useUser()
  const authorityRoutes = useAuthorityRoutes(routes)

  const router = useMemo(() => createBrowserRouter(authorityRoutes), [authorityRoutes])

  useEffect(() => {
    getUser()
  }, [])
  return (
    <ConfigProvider locale={zh_CN} theme={{ token: { colorPrimary: themeConfig.color } }}>
      <EasyModal.Provider>
        <RouterProvider router={router} />
      </EasyModal.Provider>
    </ConfigProvider>
  )
}

export default App
