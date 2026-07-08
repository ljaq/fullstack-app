import { Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router'
import routes from 'client/pages/login/routes/_route.gen'
import AntdProvider from 'client/components/AntdProvider'
import Skeleton from './Skeleton'
import './index.less'

function App() {
  return (
    <AntdProvider>
      <Suspense fallback={<Skeleton />}>
        <RouterProvider router={createBrowserRouter(routes)} />
      </Suspense>
    </AntdProvider>
  )
}

export default App
