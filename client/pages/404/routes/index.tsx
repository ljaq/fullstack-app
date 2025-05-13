import { Button, Result, Space } from 'antd'

export default function Page404() {
  return (
    <div style={{ paddingTop: 120 }}>
      <Result
        icon={<img src='/status_404.svg' alt='404' style={{ width: '100%', maxWidth: 400 }} />}
        title='找不到页面'
        extra={
          <Space>
            <Button onClick={() => window.history.back()}>
              返回上一页
            </Button>
            <Button type='primary' onClick={() => window.history.back()}>
              回到首页
            </Button>
          </Space>
        }
      />
    </div>
  )
}

export const pageConfig = {}
