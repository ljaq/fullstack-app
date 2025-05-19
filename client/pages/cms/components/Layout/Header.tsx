import { MenuFoldOutlined, MenuOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import { Breadcrumb, Button, Space, Typography } from 'antd'
import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb'
import Translate from 'client/components/Animation/Translate'
import { Fragment, useMemo } from 'react'
import { Link, useLocation } from 'react-router'
import routes from '~react-page-cms'
import { useLayoutState } from './context'
import { useStyle } from './style'

export default function Header() {
  const { collapsed, setCollapsed, isMobile } = useLayoutState()
  const { styles, cx } = useStyle()
  const { pathname } = useLocation()

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
          if (route.path === segment) {
            matchedRoute = route?.children?.[0]
            return true
          }
          if (route.children) {
            if (findRoute(route.children)) {
              return true
            }
          }
        }
      }
      findRoute(routes)

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
  }, [routes, pathname])

  return (
    <Fragment>
      {isMobile && (
        <div className={styles.logo}>
          <Button icon={<MenuOutlined />} type='text' onClick={() => setCollapsed(!collapsed)} />
          <img src='/logo.svg' style={{ marginLeft: 8 }} />
        </div>
      )}
      <div className={cx(styles.header, isMobile && 'mobile')}>
        <Space>
          {!isMobile && (
            // <Button
            //   icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            //   type='text'
            //   onClick={() => setCollapsed(!collapsed)}
            // />
            <Typography.Text type='secondary'>当前位置：</Typography.Text>
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
