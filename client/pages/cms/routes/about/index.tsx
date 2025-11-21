import { HomeOutlined } from '@ant-design/icons'
import { Editor } from '@ljaq/editor'
import { Col, Row } from 'antd'
import { CursorLightContainer, CursorLightItem } from 'client/components/CursorLight'

export default function About() {
  return (
    <div>
      <CursorLightContainer color='255,0,0'>
        <Row>
          <Col span={8}>
            <CursorLightItem>
              <div>123</div>
              <div>123</div>
            </CursorLightItem>
          </Col>
          <Col span={8}>
            <CursorLightItem>123</CursorLightItem>
          </Col>

          <Col span={8}>
            <CursorLightItem>123</CursorLightItem>
          </Col>
          <Col span={8}>
            <CursorLightItem>123</CursorLightItem>
          </Col>
          <Col span={8}>
            <CursorLightItem>123</CursorLightItem>
          </Col>
        </Row>
      </CursorLightContainer>
      <Editor mode='card' />
    </div>
  )
}

About.pageConfig = {
  name: '关于',
  order: 2,
  icon: <HomeOutlined />,
}
