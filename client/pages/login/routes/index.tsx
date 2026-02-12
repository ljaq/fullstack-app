import { App, Button, Form, Input, Space, theme } from 'antd'
import { request } from 'api'
import storages from 'client/storages'
import { formatTime } from 'client/utils/time'
import { querystring } from 'client/utils/common'
import dayjs from 'dayjs'
import { useEffect, useRef, useState } from 'react'
import { useLocalStorage } from 'react-use'
import './style.less'

export default function Login() {
  const timer = useRef<any>(null)
  const [time, setTime] = useState(formatTime(dayjs(), 'YYYY/MM/DD HH:mm'))
  const [loading, setLoading] = useState(false)
  const [_, setToken] = useLocalStorage(storages.TOKEN)
  const [form] = Form.useForm()
  const { message } = App.useApp()
  const {
    token: { colorPrimary, colorPrimaryBgHover, colorPrimaryActive, colorPrimaryHover },
  } = theme.useToken()

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
        body: querystring.stringify(data),
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
    let vantaEffect: { destroy?: () => void } | null = null

    const loadThree = () =>
      new Promise<void>((resolve, reject) => {
        if ((window as any).THREE) {
          resolve()
          return
        }
        const script = document.createElement('script')
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js'
        script.onload = () => resolve()
        script.onerror = reject
        document.head.appendChild(script)
      })

    const initVanta = () => {
      loadThree()
        .then(() => import('vanta/dist/vanta.fog.min'))
        .then(({ default: FOG }) => {
          vantaEffect = FOG({
            el: '.login',
            mouseControls: true,
            touchControls: true,
            gyroControls: true,
            minHeight: 200.0,
            minWidth: 200.0,
            zoom: 0.5,
            highlightColor: colorPrimaryHover,
            midtoneColor: colorPrimary,
            lowlightColor: colorPrimaryActive,
            baseColor: colorPrimaryBgHover,
          })
        })
    }

    // 延迟加载 vanta，先渲染表单减少白屏
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(initVanta, { timeout: 2000 })
    } else {
      setTimeout(initVanta, 500)
    }

    timer.current = setInterval(() => {
      setTime(formatTime(dayjs(), 'YYYY/MM/DD HH:mm'))
    }, 1000)

    return () => {
      clearInterval(timer.current)
      vantaEffect?.destroy?.()
    }
  }, [])

  return (
    <div className='login'>
      <div className='left-container'>
        <div className='app-name'>
          <Space>
            <span>FullStack App</span>
          </Space>
        </div>
      </div>
      <div className='login-content'>
        <div className='account-login'>
          <div className='login-content-title'>欢迎回来</div>
          <Form form={form} size='large' onFinish={handleFinish}>
            <Form.Item name='username' rules={[{ required: true, message: '请输入用户名' }]}>
              <Input placeholder='请输入用户名' variant='filled' />
            </Form.Item>
            <Form.Item name='password' rules={[{ required: true, message: '请输入密码' }]}>
              <Input.Password placeholder='请输入密码' autoComplete='new-password' variant='filled' />
            </Form.Item>

            <Button htmlType='submit' type='primary' block className='account-login-btn' loading={loading}>
              登录
            </Button>
          </Form>
        </div>

        <div className='desc'>{time}</div>
      </div>
    </div>
  )
}
