import { OrderedListOutlined } from '@ant-design/icons'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/list/')({
  meta: {
    name: 'list',
    icon: <OrderedListOutlined />,
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <div>Hello "/list/"!</div>
      <Outlet />
    </div>
  )
}
