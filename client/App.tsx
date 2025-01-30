import { Suspense } from 'react'
import { useRoutes } from 'react-router'
import routes from '~react-pages'
import Layout from './components/layout'
import { Spin, ConfigProvider } from 'antd'
import zh_CN from 'antd/locale/zh_CN'
import EasyModal from './utils/easyModal'

import './App.css'

function App() {
  return (
    <ConfigProvider locale={zh_CN}>
      <EasyModal.Provider>
        <Layout>
          <Suspense fallback={<Spin spinning />}>{useRoutes(routes)}</Suspense>
        </Layout>
      </EasyModal.Provider>
    </ConfigProvider>
  )
}

export default App
