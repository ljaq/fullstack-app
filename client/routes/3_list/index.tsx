import { OrderedListOutlined } from '@ant-design/icons'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/3_list/')({
  meta: {
    name: '嵌套路由',
    icon: <OrderedListOutlined />,
  },
  component: RouteComponent,
})

function RouteComponent(props) {
  return <div>123{props.children}</div>
}
