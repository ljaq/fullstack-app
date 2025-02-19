import { HomeOutlined } from '@ant-design/icons'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/home')({
  meta: {
    name: '首页',
    icon: <HomeOutlined />,
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/home"!</div>
}
