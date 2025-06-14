import { LogoutOutlined } from '@ant-design/icons'
import { Button, ConfigProvider, Drawer, Flex, Layout, Menu, Space, theme } from 'antd'
import Avatar from 'boring-avatars'
import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useUser } from 'client/contexts/useUser'
import routes from '~react-page-cms'
import { useLayoutState } from './context'
import { useStyle } from './style'
import Logo from './Logo'

export default function Sider() {
  const [, { logout }] = useUser()
  const { collapsed, isMobile, setCollapsed } = useLayoutState()
  const { styles } = useStyle()
  const location = useLocation()
  const navigate = useNavigate()
  const {
    token: { colorPrimary, colorPrimaryBorder },
  } = theme.useToken()

  const layoutRoutes = useMemo(() => {
    const parse = (route, prefix = '') => {
      const { path, children } = route
      const fullPath = [prefix, path].filter(p => p).join('/')
      if (!children) {
        return null
      }
      if (children.length === 1) {
        return {
          key: `/${fullPath}`,
          label: children[0].meta?.name,
          ...(children[0].meta || {}),
        }
      }
      if (children.length > 1) {
        return {
          key: `/${fullPath}`,
          label: children[0].meta?.name,
          ...(children[0].meta || {}),
          children: children.map(item => parse(item, fullPath)),
        }
      }
    }

    return routes.map(item => parse(item, ''))[0]?.children || []
  }, [routes])

  return (
    <ConfigProvider
      theme={{
        components: {
          Menu: {
            itemActiveBg: 'rgba(0, 0, 0, 0.04)',
            itemSelectedBg: 'rgba(0, 0, 0, 0.06)',
            itemSelectedColor: '#000',
          },
        },
      }}
    >
      {isMobile ? (
        <Drawer
          title={
            <Flex align='center'>
              <Logo style={{ width: 34, height: 34, marginRight: 4, flexShrink: 0 }} />
              <span>Fullstack App</span>
            </Flex>
          }
          closeIcon={null}
          open={collapsed}
          className={styles.sider}
          onClose={() => setCollapsed(false)}
          placement='left'
          styles={{ body: { padding: 0 } }}
          width={256}
        >
          <Menu mode='inline' items={layoutRoutes} selectedKeys={[location.pathname]} onSelect={e => navigate(e.key)} />
        </Drawer>
      ) : (
        <Layout.Sider theme='light' className={styles.sider} collapsed={collapsed} collapsedWidth={64} width={'100%'}>
          <div className={styles.logo} style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}>
            <Logo style={{ width: 32, height: 32, marginRight: collapsed ? 0 : 8, flexShrink: 0 }} />
            {!collapsed && <span>Fullstack App</span>}
          </div>

          <div className='menu'>
            <Menu
              mode='inline'
              items={layoutRoutes}
              selectedKeys={[location.pathname]}
              onSelect={e => navigate(e.key)}
            />
          </div>

          <Flex
            className='user'
            justify='space-between'
            align='center'
            style={{ flexDirection: collapsed ? 'column-reverse' : 'row', paddingBottom: collapsed ? 8 : 0 }}
            gap={4}
          >
            <Flex align='center' className='user-info'>
              <Avatar name='Admin' variant='beam' size={24} colors={[colorPrimaryBorder, colorPrimary]} />
              {!collapsed && <span style={{ marginLeft: 8 }}>Admin</span>}
            </Flex>
            <Space direction={collapsed ? 'vertical' : 'horizontal'}>
              <Button type='text' icon={<LogoutOutlined />} onClick={logout} />
            </Space>
          </Flex>
        </Layout.Sider>
      )}
    </ConfigProvider>
  )
}
