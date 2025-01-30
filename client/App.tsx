import { Suspense, useState } from 'react'
import './App.css'
import { useRoutes } from 'react-router'
import routes from '~react-pages'
import Layout from './components/layout'
import { Spin } from 'antd'

function App() {
  return (
    <Layout>
      <Suspense fallback={<Spin spinning />}>{useRoutes(routes)}</Suspense>
    </Layout>
  )
}

export default App
