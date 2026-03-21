import { HomeOutlined } from '@ant-design/icons'
import { redirect } from 'react-router'

export const meta = {
  name: 'list',
  order: 1,
  icon: <HomeOutlined />,
}

export const loader = () => {
  return redirect('/cms/list/list1')
}
