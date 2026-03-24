import { SettingOutlined } from '@ant-design/icons'
import { redirect } from 'react-router'

export const meta = {
  name: '系统管理',
  order: 99,
  icon: <SettingOutlined />,
}

export const loader = () => {
  return redirect('/cms/system/user')
}
