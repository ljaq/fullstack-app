import { lazy, useEffect, useMemo } from 'react'
import { createBrowserRouter, RouteObject, RouterProvider } from 'react-router'
import cmsRoutes from 'client/pages/cms/routes/_route.gen'
import { useAuthorityRoutes } from 'client/hooks/useAuthorityRoutes'
import { useUser } from 'client/contexts/useUser'
import AntdProvider from 'client/components/AntdProvider'
import EasyModal from 'client/utils/easyModal'
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
  const [_, { getUser }] = useUser()
  const authorityRoutes = useAuthorityRoutes(routes)
  const router = useMemo(() => createBrowserRouter(authorityRoutes), [authorityRoutes])

  useEffect(() => {
    getUser()
  }, [])

  return (
    <AntdProvider>
      <EasyModal.Provider>
        <RouterProvider router={router} />
      </EasyModal.Provider>
    </AntdProvider>
  )
}

export default App
