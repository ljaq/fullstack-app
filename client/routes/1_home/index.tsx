import { HomeOutlined } from '@ant-design/icons'
import { Editor } from '@ljaq/editor'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { request } from 'client/api'

export const Route = createFileRoute('/1_home/')({
  meta: {
    name: '首页',
    icon: <HomeOutlined />,
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { data, error, isPending } = useQuery({
    queryKey: ['1'],
    queryFn: () => request.token.getToken(),
  })

  console.log(data, error, isPending)

  return (
    <div>
      {data?.name}
      <Editor />
    </div>
  )
}
