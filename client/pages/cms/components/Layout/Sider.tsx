import { Button, ConfigProvider, Drawer, Flex, Layout, Menu, Space } from 'antd'
import Avatar from 'boring-avatars'
import routes from '~react-page-cms'
import { useMemo } from 'react'
import logo from './logo.svg'
import { useStyle } from './style'
import { LogoutOutlined } from '@ant-design/icons'
import { useLayoutState } from './context'
import { useLocation, useNavigate } from 'react-router'

export default function Sider() {
  const { collapsed, isMobile, setCollapsed } = useLayoutState()
  const { styles } = useStyle()
  const location = useLocation()
  const navigate = useNavigate()

  const layoutRoutes = useMemo(() => {
    const parse = (route, prefix = '') => {
      const { path, children } = route
      const fullPath = [prefix, path].filter(p => p).join('/')
      if (!children) {
        return null
      }
      if (children.length === 1) {
        return {
          key: fullPath,
          label: children[0].meta?.name,
          ...(children[0].meta || {}),
        }
      }
      if (children.length > 1) {
        return {
          key: fullPath,
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
              <img src={logo} style={{ width: 34, height: 34, marginRight: 8 }} />
              {<span>Fullstack App</span>}
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
            <img src={logo} />
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
            style={{ flexDirection: collapsed ? 'column-reverse' : 'row' }}
            gap={4}
          >
            <Flex align='center' className='user-info'>
              <Avatar name='Admin' variant='beam' size={28} />
              {!collapsed && <span style={{ marginLeft: 8 }}>Admin</span>}
            </Flex>
            <Space direction={collapsed ? 'vertical' : 'horizontal'}>
              <Button type='text' icon={<LogoutOutlined />} />
            </Space>
          </Flex>
        </Layout.Sider>
      )}
    </ConfigProvider>
  )
}
