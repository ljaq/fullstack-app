/**
 * 此路由文件 由vite-plugin-client-route 自动生成
 * 不要修改
 */
import React from 'react'
const about = React.lazy(() => import('client/pages/cms/routes/about/index.tsx'))
const home = React.lazy(() => import('client/pages/cms/routes/home/index.tsx'))
const list = React.lazy(() => import('client/pages/cms/routes/list/index.tsx'))
const list_list1 = React.lazy(() => import('client/pages/cms/routes/list/list1/index.tsx'))
const list_list2 = React.lazy(() => import('client/pages/cms/routes/list/list2/index.tsx'))
const role = React.lazy(() => import('client/pages/cms/routes/role/index.tsx'))
const user = React.lazy(() => import('client/pages/cms/routes/user/index.tsx'))

import * as about_config from 'client/pages/cms/routes/about/index.config'
import * as home_config from 'client/pages/cms/routes/home/index.config'
import * as list_config from 'client/pages/cms/routes/list/index.config'
import * as list_list1_config from 'client/pages/cms/routes/list/list1/index.config'
import * as list_list2_config from 'client/pages/cms/routes/list/list2/index.config'
import * as role_config from 'client/pages/cms/routes/role/index.config'
import * as user_config from 'client/pages/cms/routes/user/index.config'

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
        name: 'list',
        path: 'list',
        children: [
          {
            name: 'list',
            path: '',
            children: [],
            element: React.createElement(list),
            meta: safeValue(list_config, 'meta'),
            loader: safeValue(list_config, 'loader'),
            action: safeValue(list_config, 'action'),
          },
          {
            name: 'list_list1',
            path: 'list1',
            children: [
              {
                name: 'list_list1',
                path: '',
                children: [],
                element: React.createElement(list_list1),
                meta: safeValue(list_list1_config, 'meta'),
                loader: safeValue(list_list1_config, 'loader'),
                action: safeValue(list_list1_config, 'action'),
              },
            ],
          },
          {
            name: 'list_list2',
            path: 'list2',
            children: [
              {
                name: 'list_list2',
                path: '',
                children: [],
                element: React.createElement(list_list2),
                meta: safeValue(list_list2_config, 'meta'),
                loader: safeValue(list_list2_config, 'loader'),
                action: safeValue(list_list2_config, 'action'),
              },
            ],
          },
        ],
      },
      {
        name: 'role',
        path: 'role',
        children: [
          {
            name: 'role',
            path: '',
            children: [],
            element: React.createElement(role),
            meta: safeValue(role_config, 'meta'),
            loader: safeValue(role_config, 'loader'),
            action: safeValue(role_config, 'action'),
          },
        ],
      },
      {
        name: 'user',
        path: 'user',
        children: [
          {
            name: 'user',
            path: '',
            children: [],
            element: React.createElement(user),
            meta: safeValue(user_config, 'meta'),
            loader: safeValue(user_config, 'loader'),
            action: safeValue(user_config, 'action'),
          },
        ],
      },
    ],
  },
]

export default route
