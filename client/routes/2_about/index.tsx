import { CodeOutlined } from '@ant-design/icons'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/2_about/')({
  meta: {
    name: '关于',
    icon: <CodeOutlined />,
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/about"!</div>
}
