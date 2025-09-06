import { useAuthorityRoutes } from 'client/hooks/useAuthorityRoutes'
import { useMemo } from 'react'
import routes from '~react-page-cms'

const parse = (route, prefix = '') => {
  let { path, meta, children } = route
  const fullPath = [prefix, path].filter(p => p).join('/')
  if (children && children[0]?.path === '') {
    if (!meta) {
      meta = children[0].meta
    }
    children = children.slice(1)
  }

  if (!children?.length) {
    return {
      meta,
      key: `/${fullPath}`,
      label: meta?.name,
      icon: meta?.icon,
    }
  }

  return {
    meta,
    key: `/${fullPath}`,
    label: meta?.name,
    icon: meta?.icon,
    children: children.map(item => parse(item, fullPath)),
  }
}

const sorter = routes => {
  return [...routes]
    .filter(route => !route?.meta?.hide)
    .sort((a, b) => a.meta?.order - b.meta?.order)
    .map(route => {
      const children = sorter(route.children || [])
      if (children?.length) {
        return {
          ...route,
          children,
        }
      }
      delete route.children
      return route
    })
}

export function useMenu() {
  const authorityRoutes = useAuthorityRoutes(routes)

  const menu = useMemo(() => sorter(authorityRoutes.map(item => parse(item, ''))[0]?.children || []), [authorityRoutes])

  return menu
}
