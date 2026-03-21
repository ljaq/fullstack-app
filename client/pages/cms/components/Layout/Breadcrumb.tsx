import { Breadcrumb as AntBreadcrumb } from 'antd'
import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb'
import { useMemo } from 'react'
import { Link, useLocation } from 'react-router'
import { useMenu } from './useMenu'
import Translate from 'client/components/Animation/Translate'

export default function Breadcrumb() {
  const { pathname } = useLocation()
  const menu = useMenu()

  const breadcrumbs = useMemo<BreadcrumbItemType[]>(() => {
    // 标准化路径格式
    const cleanPath = pathname.replace(/\/+/g, '/').replace(/\/$/, '')
    const pathSegments = cleanPath.split('/').filter(p => p && p !== 'cms')

    const breadcrumbs: BreadcrumbItemType[] = []
    let currentPath = '/cms'
    for (const segment of pathSegments) {
      currentPath += `/${segment}`.replace('//', '/')

      let matchedRoute: any
      const findRoute = (routes: any[]) => {
        for (const route of routes) {
          if (route.key === currentPath) {
            matchedRoute = route
            return true
          }
          if (route.children) {
            if (findRoute(route.children)) {
              return true
            }
          }
        }
      }
      findRoute(menu)

      const title = matchedRoute?.meta?.name || segment

      breadcrumbs.push({
        title: (
          <Translate direction='right'>
            <div key={currentPath} style={{ whiteSpace: 'nowrap' }}>
              {currentPath === pathname ? title : <Link to={currentPath}>{title}</Link>}
            </div>
          </Translate>
        ),
      })
    }

    return breadcrumbs
  }, [menu, pathname])
  return (
    <AntBreadcrumb style={{ height: 22 }} items={breadcrumbs} separator={<Translate direction='right'>/</Translate>} />
  )
}
