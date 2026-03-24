import { useAuthority } from './useAuthority'
import { IRouteObject } from 'client/types'

export function useAuthorityRoutes(routes: IRouteObject[]) {
  const { paegs } = useAuthority()

  function withFullPath(route: IRouteObject, parentPath = ''): IRouteObject & { fullPath?: string } {
    const path = route.path || ''
    const fullPath = [parentPath, path].filter(Boolean).join('/')

    const children = route.children?.map(child => withFullPath(child, fullPath))

    return {
      ...route,
      fullPath: fullPath ? `/${fullPath}` : '',
      children,
    }
  }

  function filterByAllowedPages(routes: (IRouteObject & { fullPath?: string })[]): IRouteObject[] {
    if (!paegs || paegs.length === 0) {
      return routes
    }

    return routes
      .map(route => {
        const children = route.children ? filterByAllowedPages(route.children as any) : []
        const isLeaf = !route.children || route.children.length === 0
        const canVisit = route.fullPath && paegs.includes(route.fullPath)

        if (isLeaf) {
          return canVisit ? { ...route, children: [] } : null
        }

        if (children.length > 0 || canVisit) {
          return { ...route, children }
        }

        return null
      })
      .filter(Boolean) as IRouteObject[]
  }

  const withPath = routes.map(r => withFullPath(r))
  return filterByAllowedPages(withPath as any)
}
