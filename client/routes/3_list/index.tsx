import { OrderedListOutlined } from '@ant-design/icons'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/3_list/')({
  meta: {
    name: '嵌套路由',
    icon: <OrderedListOutlined />,
  },
  component: RouteComponent,
  beforeLoad: () => {
    return redirect({
      to: '/list/list1',
    })
  },
})

function RouteComponent() {
  return <div></div>
}
