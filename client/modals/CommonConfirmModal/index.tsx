import { App, Divider, Modal, Space, theme } from 'antd'
import { ReactNode, useMemo, useState } from 'react'
import EasyModal from '../../utils/easyModal'

import './style.less'

type Color = 'success' | 'warning' | 'error'

interface IProps {
  title?: string
  tip: string
  color?: Color
  children?: ReactNode
  onOk?: (() => void) | (() => Promise<any>)
}

const CommonConfirmModal = EasyModal.create<IProps>(modal => {
  const { open, hide, resolve, reject, props } = modal
  const { title = '提示', tip, color = 'error', onOk } = props
  const { message } = App.useApp()
  const [loading, setLoading] = useState(false)
  const { token } = theme.useToken()

  const children = useMemo(() => {
    const tipSplited = tip.split('$')
    return (
      <Space>
        {tipSplited.map((s, i) =>
          i % 2 === 1 ? (
            <span key={i} style={{ color: token[`color${color[0].toUpperCase() + color.slice(1)}Text`] }}>
              {s}
            </span>
          ) : (
            <span key={i}>{s}</span>
          ),
        )}
      </Space>
    )
  }, [tip, color])

  const handleCancel = () => {
    reject()
    hide()
  }

  const handleOk = async () => {
    try {
      if (onOk) {
        setLoading(true)
        await onOk()
        setLoading(false)
        message.success('操作成功')
      }
      resolve()
      hide()
    } catch (err) {
      setLoading(false)
    }
  }

  return (
    <Modal
      title={title}
      open={open}
      onCancel={handleCancel}
      onOk={handleOk}
      confirmLoading={loading}
      className='common-confirm-modal'
    >
      <div
        className='content'
        style={{ textAlign: props.children ? 'left' : 'center', paddingBottom: props.children ? 0 : 12 }}
      >
        {children}
      </div>
      {props.children && <Divider />}
      {props.children}
    </Modal>
  )
})

export default CommonConfirmModal
