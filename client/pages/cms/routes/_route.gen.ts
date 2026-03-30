/**
 * 此路由文件 由vite-plugin-client-route 自动生成
 * 不要修改
 */
import React from 'react'
const about = React.lazy(() => import('client/pages/cms/routes/about/index.tsx'))
const home = React.lazy(() => import('client/pages/cms/routes/home/index.tsx'))
const system = React.lazy(() => import('client/pages/cms/routes/system/index.tsx'))
const system_role = React.lazy(() => import('client/pages/cms/routes/system/role/index.tsx'))
const system_user = React.lazy(() => import('client/pages/cms/routes/system/user/index.tsx'))

import * as about_config from 'client/pages/cms/routes/about/index.config'
import * as home_config from 'client/pages/cms/routes/home/index.config'
import * as system_config from 'client/pages/cms/routes/system/index.config'
import * as system_role_config from 'client/pages/cms/routes/system/role/index.config'
import * as system_user_config from 'client/pages/cms/routes/system/user/index.config'

const safeValue = (data, key) => (key in data ? data[key] : null)

const route = [
  {
    path: 'cms',
    children: [
      {
        name: 'about',
        path: 'about',
        children: [
          {
            name: 'about',
            path: '',
            children: [],
            element: React.createElement(about),
            meta: safeValue(about_config, 'meta'),
            loader: safeValue(about_config, 'loader'),
            action: safeValue(about_config, 'action'),
          },
        ],
      },
      {
        name: 'home',
        path: 'home',
        children: [
          {
            name: 'home',
            path: '',
            children: [],
            element: React.createElement(home),
            meta: safeValue(home_config, 'meta'),
            loader: safeValue(home_config, 'loader'),
            action: safeValue(home_config, 'action'),
          },
        ],
      },
      {
        name: 'system',
        path: 'system',
        children: [
          {
            name: 'system',
            path: '',
            children: [],
            element: React.createElement(system),
            meta: safeValue(system_config, 'meta'),
            loader: safeValue(system_config, 'loader'),
            action: safeValue(system_config, 'action'),
          },
          {
            name: 'system_role',
            path: 'role',
            children: [
              {
                name: 'system_role',
                path: '',
                children: [],
                element: React.createElement(system_role),
                meta: safeValue(system_role_config, 'meta'),
                loader: safeValue(system_role_config, 'loader'),
                action: safeValue(system_role_config, 'action'),
              },
            ],
          },
          {
            name: 'system_user',
            path: 'user',
            children: [
              {
                name: 'system_user',
                path: '',
                children: [],
                element: React.createElement(system_user),
                meta: safeValue(system_user_config, 'meta'),
                loader: safeValue(system_user_config, 'loader'),
                action: safeValue(system_user_config, 'action'),
              },
            ],
          },
        ],
      },
    ],
  },
]

export default route
