/*
route

name: name-override
meta:
  requiresAuth: false
  id: 1234
  string: "1234"
*/

import { HomeOutlined } from '@ant-design/icons'
import { Editor } from '@ljaq/editor'
import PageContainer from '../../components/PageContainer'

export default function About() {
  return (
    <PageContainer>
      <div>
        <Editor />
      </div>
    </PageContainer>
  )
}

export const pageConfig = {
  name: '关于',
  icon: <HomeOutlined />,
}
