import { ProductOutlined } from '@ant-design/icons'
import { App, Button, Form, Input, Space } from 'antd'
import { request } from 'client/api'
import storages from 'client/storages'
import qs from 'querystring'
import { useEffect, useState } from 'react'
import { useLocalStorage } from 'react-use'
import FOG from 'vanta/dist/vanta.fog.min'
import './style.less'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [_, setToken] = useLocalStorage(storages.TOKEN)
  const [form] = Form.useForm()
  const { message } = App.useApp()

  const handleFinish = async (fields: any) => {
    setLoading(true)
    try {
      const data = {
        ...fields,
        grant_type: 'password',
        scope: 'NonWasteCity offline_access',
        client_id: 'NonWasteCity_App',
      }
      const res = await request.authority.login({
        method: 'POST',
        body: qs.stringify(data),
      })
      setToken(res)
      location.href = '/cms'
    } catch (err: any) {
      const msg = err?.response.data?.error?.message
      message.error({
        content: msg,
        className: 'login-msg',
      })
      if (msg === '用户名密码错误') {
        form.setFields([{ name: 'password', errors: [''] }])
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    FOG({
      el: '.login',
      mouseControls: true,
      touchControls: true,
      gyroControls: true,
      minHeight: 200.0,
      minWidth: 200.0,
      zoom: 0.5,
      highlightColor: '#00CCFF',
      midtoneColor: '#0077FF',
      lowlightColor: '#00007F',
      baseColor: '#E6F7FF',
    })
  }, [])

  return (
    <div className='login'>
      <div className='left-container'>
        <div className='app-name'>
          <Space>
            <ProductOutlined />
            <span>FullStack App</span>
          </Space>
        </div>
      </div>
      <div className='login-content'>
        <div className='account-login'>
          <div className='login-content-title'>欢迎回来</div>
          <Form form={form} size='large' onFinish={handleFinish}>
            <Form.Item name='username' rules={[{ required: true, message: '请输入用户名' }]}>
              <Input placeholder='请输入用户名' />
            </Form.Item>
            <Form.Item name='password' rules={[{ required: true, message: '请输入密码' }]}>
              <Input.Password placeholder='请输入密码' autoComplete='new-password' />
            </Form.Item>

            <Button htmlType='submit' type='primary' block className='account-login-btn' loading={loading}>
              登录
            </Button>
          </Form>
        </div>

        <div className='desc'>请联系管理员开通权限</div>
      </div>
    </div>
  )
}

export const pageConfig = {
  icon: <div></div>,
  name: 'login',
}
