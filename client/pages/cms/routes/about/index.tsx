import { HomeOutlined } from '@ant-design/icons'
import { Editor } from '@ljaq/editor'

export default function About() {
  return (
    <div>
      <Editor mode='card' />
    </div>
  )
}

About.pageConfig = {
  name: '关于',
  order: 2,
  icon: <HomeOutlined />,
}
