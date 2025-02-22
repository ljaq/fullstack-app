import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { ConfigProvider, Spin } from 'antd'
import zh_CN from 'antd/locale/zh_CN'
import Layout from 'client/components/Layout/index'
import EasyModal from 'client/utils/easyModal'
import { Suspense } from 'react'

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
