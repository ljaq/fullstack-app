import { MenuFoldOutlined, MenuOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import { Badge, Breadcrumb, Button, Popover, Space, theme, Typography } from 'antd'
import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb'
import Translate from 'client/components/Animation/Translate'
import { Fragment, useMemo } from 'react'
import { Link, useLocation } from 'react-router'
import routes from '~react-page-cms'
import { useLayoutState } from './context'
import { useStyle } from './style'
import { themeList } from './conf'
import { useUser } from 'client/contexts/useUser'

export default function Header() {
  const [, { setThemeConfig }] = useUser()
  const { collapsed, setCollapsed, isMobile } = useLayoutState()
  const { styles, cx } = useStyle()
  const { pathname } = useLocation()
  const { colorPrimary } = theme.useToken().token

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
        <Popover
          arrow={false}
          content={
            <Space style={{ width: 154 }} wrap>
              {themeList.map(color => (
                <Button
                  key={color}
                  type='text'
                  size='small'
                  icon={<Badge dot status={colorPrimary === color ? 'processing' : 'default'} color={color} />}
                  onClick={() => setThemeConfig({ color })}
                />
              ))}
            </Space>
          }
          placement='bottomRight'
        >
          <Badge dot status='processing' color={colorPrimary} />
        </Popover>
      </div>
    </Fragment>
  )
}
