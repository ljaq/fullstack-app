import { Button, Result, Space } from 'antd'
import { useNavigate } from 'react-router'

export default function Page404({ crossPage = true }: { crossPage?: boolean }) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (crossPage) {
      window.history.back()
    } else {
      navigate(-1)
    }
  }

  const handleHome = () => {
    if (crossPage) {
      window.location.href = '/'
    } else {
      navigate('/')
    }
  }
  return (
    <div style={{ paddingTop: 120 }}>
      <Result
        icon={<img src='/status_404.svg' alt='404' style={{ width: '100%', maxWidth: 400 }} />}
        title='找不到页面'
        extra={
          <Space>
            <Button onClick={handleBack}>返回上一页</Button>
            <Button type='primary' onClick={handleHome}>
              回到首页
            </Button>
          </Space>
        }
      />
    </div>
  )
}

export const pageConfig = {}
