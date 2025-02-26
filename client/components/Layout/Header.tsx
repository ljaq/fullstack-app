import { HomeOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import { Link, useLocation } from '@tanstack/react-router'
import { Breadcrumb, Button, Space } from 'antd'
import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb'
import { routeTree } from 'client/routeTree.gen'
import { useMemo } from 'react'
import { useStyle } from './style'

export default function Header(props: { collapsed: boolean; setCollapsed: (collapsed: boolean) => void }) {
  const { collapsed, setCollapsed } = props
  const { styles } = useStyle()
  const { pathname } = useLocation()

  const breadcrumbs = useMemo<BreadcrumbItemType[]>(() => {
    // 标准化路径格式
    const cleanPath = pathname.replace(/\/+/g, '/').replace(/\/$/, '')
    const pathSegments = cleanPath.split('/').filter(p => p)

    const breadcrumbs: BreadcrumbItemType[] = []
    let currentPath = ''

    for (const segment of pathSegments) {
      currentPath += `/${segment}`.replace('//', '/')

      const matchedRoute = (routeTree.children as any).find(r => {
        // 标准化路由路径
        const routePath = '/' + r.path.replace(/^\/+/g, '').replace(/\/+/g, '/').replace(/\/$/, '')
        return routePath === currentPath
      })

      console.log(matchedRoute, currentPath)

      const title = matchedRoute?.options?.meta?.name || segment

      breadcrumbs.push({
        title: currentPath === pathname ? title : <Link to={currentPath}>{title}</Link>, // 优先使用配置的name，否则使用路径段
      })
    }

    return breadcrumbs
  }, [routeTree, pathname])

  console.log(breadcrumbs)

  return (
    <div className={styles.header}>
      <Space>
        <Button
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          type='text'
          onClick={() => setCollapsed(!props.collapsed)}
        />
        <Breadcrumb items={breadcrumbs} />
      </Space>
    </div>
  )
}
