import { MenuFoldOutlined, MenuOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import { Link, useLocation } from '@tanstack/react-router'
import { Breadcrumb, Button, Space } from 'antd'
import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb'
import { routeTree } from 'client/routeTree.gen'
import { Fragment, useMemo } from 'react'
import { useStyle } from './style'
import Translate from '../Animation/Translate'
import { useLayoutState } from './context'
import logo from './logo.svg'

export default function Header() {
  const { collapsed, setCollapsed, isMobile } = useLayoutState()
  const { styles, cx } = useStyle()
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

      const title = matchedRoute?.options?.meta?.name || segment

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
  }, [routeTree, pathname])

  console.log(breadcrumbs)

  return (
    <Fragment>
      {isMobile && (
        <div className={styles.logo}>
          <Button icon={<MenuOutlined />} type='text' onClick={() => setCollapsed(!collapsed)} />
          <img src={logo} style={{ marginLeft: 8 }} />
        </div>
      )}
      <div className={cx(styles.header, isMobile && 'mobile')}>
        <Space>
          {!isMobile && (
            <Button
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              type='text'
              onClick={() => setCollapsed(!collapsed)}
            />
          )}
          <Breadcrumb
            style={{ height: 22 }}
            items={breadcrumbs}
            separator={<Translate direction='right'>/</Translate>}
          />
        </Space>
      </div>
    </Fragment>
  )
}
