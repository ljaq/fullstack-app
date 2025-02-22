import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { Button, ConfigProvider, Layout, Menu } from 'antd'
import { routeTree } from 'client/routeTree.gen'
import { useMemo, useState } from 'react'
import logo from './logo.svg'
import { useStyle } from './style'

export default function Sider() {
  const { styles } = useStyle()
  const location = useLocation()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

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
    <Layout.Sider theme='light' className={styles.sider} collapsed={collapsed} collapsedWidth={64}>
      <div className={styles.logo} style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}>
        <img src={logo} />
        {!collapsed && <span>Fullstack App</span>}
      </div>
      <Button
        className='action'
        icon={collapsed ? <RightOutlined /> : <LeftOutlined />}
        onClick={() => setCollapsed(!collapsed)}
      />
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
        <div className='menu'>
          <Menu
            mode='inline'
            items={layoutRoutes}
            selectedKeys={[location.pathname]}
            onSelect={e => navigate({ to: e.key })}
          />
        </div>
      </ConfigProvider>
    </Layout.Sider>
  )
}
