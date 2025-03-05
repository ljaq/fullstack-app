import { Outlet, createRootRoute, useLocation } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { ConfigProvider, Spin } from 'antd'
import zh_CN from 'antd/locale/zh_CN'
import Translate from 'client/components/Animation/Translate'
import Layout from 'client/components/Layout/index'
import EasyModal from 'client/utils/easyModal'
import { Suspense } from 'react'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent(props) {
  const { pathname } = useLocation()
  return (
    <ConfigProvider locale={zh_CN} theme={{ token: { colorPrimary: '#1677ff' } }}>
      <EasyModal.Provider>
        <Layout>
          <Suspense fallback={<Spin spinning />}>
            <Translate key={pathname} distance={40}>
              <Outlet />
            </Translate>
          </Suspense>
          <TanStackRouterDevtools position='bottom-right' />
        </Layout>
      </EasyModal.Provider>
    </ConfigProvider>
  )
}
