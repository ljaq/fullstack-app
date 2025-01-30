import { Space, Button, Card, Row, Col, Form } from 'antd'
import { CSSProperties, ForwardedRef, forwardRef, useImperativeHandle } from 'react'
import { IFormItem, getFormItem } from '../../utils/getFormItem'

export interface ToolRowProps {
  toolList: IFormItem[]
  toolLabelWidth?: number | string
  className?: string
  style?: CSSProperties
}

export interface ToolRowInstance {
  getParams: () => { [key: string]: any }
}

function ToolRow(
  { toolList, toolLabelWidth = 100, className, style, onFetch }: ToolRowProps & { onFetch?: (fields: any) => void },
  ref: ForwardedRef<ToolRowInstance>,
) {
  const [form] = Form.useForm()

  useImperativeHandle(ref, () => {
    return {
      getParams: form.getFieldsValue,
    }
  })

  return (
    <Card className={className} style={style} styles={{ body: { paddingBottom: 0 } }}>
      <Form form={form} onFinish={onFetch} labelWrap labelCol={{ style: { width: toolLabelWidth } }} variant='filled'>
        <Row gutter={16}>
          {toolList.map(item => (
            <Col key={item.name} xxl={6} xl={8} lg={8} md={12} sm={24}>
              {getFormItem(item)}
            </Col>
          ))}
          <Col flex={'auto'}>
            <Row justify='end'>
              <Space style={{ marginBottom: 24 }}>
                <Button
                  onClick={() => {
                    form.resetFields()
                    form.submit()
                  }}
                >
                  重置
                </Button>
                <Button type='primary' onClick={form.submit}>
                  查询
                </Button>
              </Space>
            </Row>
          </Col>
        </Row>
      </Form>
    </Card>
  )
}

export default forwardRef(ToolRow)
