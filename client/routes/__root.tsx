import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Outlet, createRootRoute, useLocation } from '@tanstack/react-router'
import { ConfigProvider, Spin } from 'antd'
import zh_CN from 'antd/locale/zh_CN'
import Translate from 'client/components/Animation/Translate'
import Layout from 'client/components/Layout/index'
import TanstackDevTools from 'client/components/TanstackDevTools'
import EasyModal from 'client/utils/easyModal'
import { Suspense } from 'react'

export const Route = createRootRoute({
  component: RootComponent,
})

const queryClient = new QueryClient()

function RootComponent() {
  const { pathname } = useLocation()
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider locale={zh_CN} theme={{ token: { colorPrimary: '#1677ff' } }}>
        <EasyModal.Provider>
          <Layout>
            <Suspense fallback={<Spin spinning />}>
              <Translate key={pathname} distance={40}>
                <Outlet />
              </Translate>
            </Suspense>
          </Layout>
        </EasyModal.Provider>
      </ConfigProvider>
      <TanstackDevTools />
    </QueryClientProvider>
  )
}
