/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as HomeImport } from './routes/home'
import { Route as AboutImport } from './routes/about'
import { Route as ListIndexImport } from './routes/list/index'
import { Route as ListList2IndexImport } from './routes/list/list2/index'
import { Route as ListList1IndexImport } from './routes/list/list1/index'

// Create/Update Routes

const HomeRoute = HomeImport.update({
  id: '/home',
  path: '/home',
  getParentRoute: () => rootRoute,
} as any)

const AboutRoute = AboutImport.update({
  id: '/about',
  path: '/about',
  getParentRoute: () => rootRoute,
} as any)

const ListIndexRoute = ListIndexImport.update({
  id: '/list/',
  path: '/list/',
  getParentRoute: () => rootRoute,
} as any)

const ListList2IndexRoute = ListList2IndexImport.update({
  id: '/list/list2/',
  path: '/list/list2/',
  getParentRoute: () => rootRoute,
} as any)

const ListList1IndexRoute = ListList1IndexImport.update({
  id: '/list/list1/',
  path: '/list/list1/',
  getParentRoute: () => rootRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/about': {
      id: '/about'
      path: '/about'
      fullPath: '/about'
      preLoaderRoute: typeof AboutImport
      parentRoute: typeof rootRoute
    }
    '/home': {
      id: '/home'
      path: '/home'
      fullPath: '/home'
      preLoaderRoute: typeof HomeImport
      parentRoute: typeof rootRoute
    }
    '/list/': {
      id: '/list/'
      path: '/list'
      fullPath: '/list'
      preLoaderRoute: typeof ListIndexImport
      parentRoute: typeof rootRoute
    }
    '/list/list1/': {
      id: '/list/list1/'
      path: '/list/list1'
      fullPath: '/list/list1'
      preLoaderRoute: typeof ListList1IndexImport
      parentRoute: typeof rootRoute
    }
    '/list/list2/': {
      id: '/list/list2/'
      path: '/list/list2'
      fullPath: '/list/list2'
      preLoaderRoute: typeof ListList2IndexImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/about': typeof AboutRoute
  '/home': typeof HomeRoute
  '/list': typeof ListIndexRoute
  '/list/list1': typeof ListList1IndexRoute
  '/list/list2': typeof ListList2IndexRoute
}

export interface FileRoutesByTo {
  '/about': typeof AboutRoute
  '/home': typeof HomeRoute
  '/list': typeof ListIndexRoute
  '/list/list1': typeof ListList1IndexRoute
  '/list/list2': typeof ListList2IndexRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/about': typeof AboutRoute
  '/home': typeof HomeRoute
  '/list/': typeof ListIndexRoute
  '/list/list1/': typeof ListList1IndexRoute
  '/list/list2/': typeof ListList2IndexRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/about' | '/home' | '/list' | '/list/list1' | '/list/list2'
  fileRoutesByTo: FileRoutesByTo
  to: '/about' | '/home' | '/list' | '/list/list1' | '/list/list2'
  id:
    | '__root__'
    | '/about'
    | '/home'
    | '/list/'
    | '/list/list1/'
    | '/list/list2/'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  AboutRoute: typeof AboutRoute
  HomeRoute: typeof HomeRoute
  ListIndexRoute: typeof ListIndexRoute
  ListList1IndexRoute: typeof ListList1IndexRoute
  ListList2IndexRoute: typeof ListList2IndexRoute
}

const rootRouteChildren: RootRouteChildren = {
  AboutRoute: AboutRoute,
  HomeRoute: HomeRoute,
  ListIndexRoute: ListIndexRoute,
  ListList1IndexRoute: ListList1IndexRoute,
  ListList2IndexRoute: ListList2IndexRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/about",
        "/home",
        "/list/",
        "/list/list1/",
        "/list/list2/"
      ]
    },
    "/about": {
      "filePath": "about.tsx"
    },
    "/home": {
      "filePath": "home.tsx"
    },
    "/list/": {
      "filePath": "list/index.tsx"
    },
    "/list/list1/": {
      "filePath": "list/list1/index.tsx"
    },
    "/list/list2/": {
      "filePath": "list/list2/index.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
