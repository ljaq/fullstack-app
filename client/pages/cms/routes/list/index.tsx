import { HomeOutlined } from '@ant-design/icons'
import Redirect from 'client/components/Redirect'
import { useOutlet } from 'react-router'

export default function List() {
  const outlet = useOutlet()

  if (!outlet) return <Redirect to='/cms/list/list1' />

  return outlet
}

List.pageConfig = {
  name: 'list',
  order: 1,
  icon: <HomeOutlined />,
}
