import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/3_list/list2/')({
  meta: {
    name: 'list2',
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/list/list2/"!</div>
}
