import { ProLayout, PageContainer, ProBreadcrumb } from '@ant-design/pro-layout'
import { ReactNode, useMemo } from 'react'
import { Link } from 'react-router'
import routes from '~react-pages'

interface IProps {
  children: ReactNode
}

export default function Layout(props: IProps) {
  const layoutRoutes = useMemo(() => {
    const parse = route => {
      const { path, children } = route
      if (!children) {
        return { path }
      }
      if (children.length === 1) {
        return {
          path,
          ...children[0].meta,
        }
      }
      if (children.length > 1) {
        return {
          path,
          ...children[0].meta,
          children: children.map(parse),
        }
      }
    }

    return routes.map(parse)
  }, [routes])

  return (
    <ProLayout
      route={{ routes: layoutRoutes }}
      menu={{ type: 'sub', autoClose: false, ignoreFlatMenu: true }}
      menuItemRender={(item, dom) => {
        return <Link to={item.redirect && item.redirect.startsWith(item.path) ? item.redirect : item.path}>{dom}</Link>
      }}
    >
      <ProBreadcrumb />
      <PageContainer>{props.children}</PageContainer>
    </ProLayout>
  )
}
