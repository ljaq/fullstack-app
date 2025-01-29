import { Suspense, useState } from 'react'
import './App.css'
import { useRoutes } from 'react-router'
import routes from '~react-pages'

function App() {
  console.log(routes)

  return <Suspense fallback={<p>Loading...</p>}>{useRoutes(routes)}</Suspense>
}

export default App
