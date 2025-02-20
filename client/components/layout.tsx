import { LogoutOutlined, UserOutlined } from '@ant-design/icons'
import { ProLayout, PageContainer } from '@ant-design/pro-layout'
import { ReactNode, useMemo } from 'react'
import { routeTree } from 'client/routeTree.gen'
import { Link, useLocation } from '@tanstack/react-router'

interface IProps {
  children: ReactNode
}

export default function Layout(props: IProps) {
  const location = useLocation()

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
        let child = currentNode.children.find(c => c.path === currentPath)

        if (!child) {
          child = {
            path: currentPath,
            name: part, // 默认名称使用路径片段
            children: [],
          }
          currentNode.children.push(child)
        }

        currentNode = child

        // 如果是当前路由的实际路径，合并路由信息
        if (currentPath === path) {
          Object.assign(currentNode, meta)
        }
      }
    })
    return root.children
  }, [routeTree])

  return (
    <ProLayout
      route={{ routes: layoutRoutes }}
      menu={{ type: 'sub', autoClose: false, ignoreFlatMenu: true }}
      selectedKeys={[location.pathname]}
      menuItemRender={(item, dom) => {
        return <Link to={item.redirect && item.redirect.startsWith(item.path) ? item.redirect : item.path}>{dom}</Link>
      }}
      avatarProps={{
        src: 'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
        title: '七妮妮',
        icon: <UserOutlined />,
      }}
      actionsRender={() => [<LogoutOutlined />]}
    >
      <PageContainer>{props.children}</PageContainer>
    </ProLayout>
  )
}
