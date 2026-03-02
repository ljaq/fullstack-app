/**
 * 此路由文件 由vite-plugin-client-route 自动生成
 * 不要修改
 */
import React from 'react'
const index = React.lazy(() => import('client/pages/404/routes/index.tsx'))

import * as index_config from 'client/pages/404/routes/index.config'

const safeValue = (data, key) => (key in data ? data[key] : null)

const route = [
  {
    path: '404',
    children: [
      {
        name: 'index',
        path: '',
        children: [],
        element: React.createElement(index),
        meta: safeValue(index_config, 'meta'),
        loader: safeValue(index_config, 'loader'),
        action: safeValue(index_config, 'action'),
      },
    ],
  },
]

export default route
