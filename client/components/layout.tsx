import { LogoutOutlined, UserOutlined } from '@ant-design/icons'
import { ProLayout, PageContainer, ProBreadcrumb } from '@ant-design/pro-layout'
import { ReactNode, useMemo } from 'react'
import { routeTree } from 'client/routeTree.gen'
import { Link, useLocation } from '@tanstack/react-router'

interface IProps {
  children: ReactNode
}

export default function Layout(props: IProps) {
  const location = useLocation()
  const layoutRoutes = useMemo(() => {
    const parse = route => {
      const {
        options: { meta },
        id: path,
        children,
      } = route

      console.log(meta)

      if (!children || children.length === 1) {
        return { path, ...meta }
      }

      return {
        path,
        ...meta,
        routes: children.map(parse),
      }
    }

    return (routeTree.children as any)?.map(parse)
  }, [routeTree])

  console.log(layoutRoutes, location)

  return (
    <ProLayout
      route={{ routes: layoutRoutes }}
      menu={{ type: 'sub', autoClose: false, ignoreFlatMenu: true }}
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
      <ProBreadcrumb />
      <PageContainer>{props.children}</PageContainer>
    </ProLayout>
  )
}
