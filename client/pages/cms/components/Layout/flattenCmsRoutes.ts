import { useMemo } from 'react'
import routes from 'client/pages/cms/routes/_route.gen'
import { useAuthorityRoutes } from 'client/hooks/useAuthorityRoutes'
import type { IMeta, IRouteObject } from 'client/types'

function collectLeaves(route: IRouteObject, prefix = ''): Array<{ path: string; meta: IMeta }> {
  let { path, meta, children } = route
  const fullPath = [prefix, path].filter(p => p).join('/')
  if (children && children[0]?.path === '') {
    const indexChild = children[0] as IRouteObject
    if (!meta) meta = indexChild.meta
    children = children.slice(1)
  }
  if (!children?.length) {
    if (meta?.name) return [{ path: `/${fullPath}`, meta }]
    return []
  }
  return children.flatMap((c: IRouteObject) => collectLeaves(c, fullPath))
}

/** 可访问 CMS 叶子路由 path → meta（与侧栏菜单同源） */
export function useCmsRouteMetaMap() {
  const authorityRoutes = useAuthorityRoutes(routes)

  return useMemo(() => {
    const map = new Map<string, IMeta>()
    const root = authorityRoutes[0] as IRouteObject | undefined
    if (!root) return map
    for (const leaf of collectLeaves(root, '')) {
      map.set(leaf.path, leaf.meta)
    }
    return map
  }, [authorityRoutes])
}
