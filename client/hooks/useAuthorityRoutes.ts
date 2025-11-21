import { useAuthority } from './useAuthority'
import { IRouteObject } from 'client/types'

const parse = route => {
  let children = route.children

  let meta = route.meta
  if (!meta && children && children[0]?.path === '') {
    meta = children[0].meta
  }

  if (!children?.length) {
    return {
      meta,
      ...route,
    }
  }

  return {
    meta,
    ...route,
    children: children.map(item => parse(item)),
  }
}

export function useAuthorityRoutes(routes: IRouteObject[]) {
  const { hasAuthority } = useAuthority()

  function filterRoutes(routes: IRouteObject[]): IRouteObject[] {
    return routes
      .filter(route => hasAuthority(route.meta?.authority))
      .map(route => {
        if (route.children) {
          return {
            ...route,
            children: filterRoutes(route.children),
          }
        }
        return route
      })
  }

  const parsed = routes.map(item => parse(item))

  const res = filterRoutes(parsed)

  return res
}
