import { HomeOutlined } from '@ant-design/icons'
import { Editor } from '@ljaq/editor'

export default function About() {
  return (
    <div>
      <Editor />
    </div>
  )
}

export const pageConfig = {
  name: 'about',
  icon: <HomeOutlined />,
}
