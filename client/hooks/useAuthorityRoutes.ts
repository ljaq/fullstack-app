import { useAuthority } from './useAuthority'
import { IRouteObject } from 'client/types'

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

  return filterRoutes(routes)
}
