import { App, Badge, Divider, Modal, Space } from 'antd'
import { ReactNode, useMemo, useState } from 'react'
import EasyModal from '../../utils/easyModal'
import { InfoCircleOutlined } from '@ant-design/icons'

import './style.less'

interface IProps {
  title?: string
  tip: string
  color?: string
  children?: ReactNode
  onOk?: () => Promise<any>
}

const CommonConfirmModal = EasyModal.create<IProps>(modal => {
  const { open, hide, resolve, reject, props } = modal
  const { title = '提示', tip, color = '#DB0000', onOk } = props
  const { message } = App.useApp()
  const [loading, setLoading] = useState(false)

  const children = useMemo(() => {
    const [s, h, e] = tip.split('$')
    return (
      <Space>
        {s}
        <span style={{ color }}>{h}</span>
        {e}
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
    } catch {
      setLoading(false)
    }
  }

  return (
    <Modal
      title={
        <Badge dot color={color} text={title} status='processing' />
        // <Space>
        //   <InfoCircleOutlined />
        //   {title}
        // </Space>
      }
      open={open}
      onCancel={handleCancel}
      onOk={handleOk}
      confirmLoading={loading}
      className='common-confirm-modal'
      zIndex={10000}
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
