import { useLocation, useNavigate } from '@tanstack/react-router'
import { Button, ConfigProvider, Drawer, Flex, Layout, Menu, Space } from 'antd'
import Avatar from 'boring-avatars'
import { routeTree } from 'client/routeTree.gen'
import { useMemo } from 'react'
import logo from './logo.svg'
import { useStyle } from './style'
import { LogoutOutlined } from '@ant-design/icons'
import { useLayoutState } from './context'

export default function Sider() {
  const { collapsed, isMobile, setCollapsed } = useLayoutState()
  const { styles } = useStyle()
  const location = useLocation()
  const navigate = useNavigate()

  const layoutRoutes = useMemo(() => {
    const root: any = { path: '', children: [] }

    ;(routeTree.children as any)?.forEach(route => {
      const {
        options: { meta },
        id,
      } = route
      const path = id.replace(/\/$/, '')

      const parts = path.split('/').filter(p => p !== '')
      let currentNode = root

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i]
        const currentPath = `${currentNode.path}/${part}`.replace('//', '/') // 处理根路径情况
        let child = currentNode.children?.find(c => c.path === currentPath)

        if (!child) {
          child = {
            key: currentPath,
            path: currentPath,
            name: part, // 默认名称使用路径片段
          }
          if (currentNode.children) {
            currentNode.children.push(child)
          } else {
            currentNode.children = [child]
          }
        }

        currentNode = child

        // 如果是当前路由的实际路径，合并路由信息
        if (currentPath === path) {
          Object.assign(currentNode, meta, { label: meta.name })
        }
      }
    })
    return root.children
  }, [routeTree])

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
          <Menu
            mode='inline'
            items={layoutRoutes}
            selectedKeys={[location.pathname]}
            onSelect={e => navigate({ to: e.key })}
          />
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
              onSelect={e => navigate({ to: e.key })}
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
