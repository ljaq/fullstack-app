import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { Suspense } from 'react'
import Layout from 'client/components/layout.tsx'
import { Spin, ConfigProvider } from 'antd'
import zh_CN from 'antd/locale/zh_CN'
import EasyModal from 'client/utils/easyModal'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <ConfigProvider locale={zh_CN}>
      <EasyModal.Provider>
        <Layout>
          <Suspense fallback={<Spin spinning />}>
            <Outlet />
          </Suspense>
          <TanStackRouterDevtools position='bottom-right' />
        </Layout>
      </EasyModal.Provider>
    </ConfigProvider>
  )
}
