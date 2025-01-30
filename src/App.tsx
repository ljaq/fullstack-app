import { Suspense, useState } from 'react'
import './App.css'
import { useRoutes } from 'react-router'
import routes from '~react-pages'
import Layout from './components/layout'

function App() {
  return (
    <Layout>
      <Suspense fallback={<p>Loading...</p>}>{useRoutes(routes)}</Suspense>
    </Layout>
  )
}

export default App
