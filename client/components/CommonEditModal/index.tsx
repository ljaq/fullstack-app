import { App, Modal, Spin } from 'antd'
import { SchemaBase } from 'form-render'
import { forwardRef, useCallback, useImperativeHandle, useMemo, useState } from 'react'
import FormRender, { useForm } from '../FormRender'

interface IProps {
  name: string
  schema: SchemaBase
  onEdit?: (id: string | number, values: any, orgValues: any) => Promise<void> | void
  onCreate?: (values: any) => Promise<void> | void
  onValuesChange?: (values: any) => void
  labelWidth?: number | string
  idKey?: string
  okText?: string
}

type IOptions = {
  readonly?: boolean
  disabled?: boolean
}

export interface CommonEditModalInstance {
  show: (status: boolean | any, options?: IOptions) => void
}

function CommonEditModal(props: IProps, ref) {
  const { name, onCreate, onEdit, schema, idKey = 'id', okText, onValuesChange } = props
  const { message } = App.useApp()
  const [showModal, setShowModal] = useState<boolean | any>(false)
  const [readonly, setReadonly] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [initLoading, setInitLoading] = useState(false)
  const form = useForm()

  const title = useMemo(() => {
    if (readonly) return `${name}详情`
    return typeof showModal === 'object' ? `编辑${name}` : `新增${name}`
  }, [name, readonly, showModal])

  useImperativeHandle(ref, () => {
    return {
      show,
    }
  })

  const show = useCallback(
    async (s: any, options: IOptions = {}) => {
      const { readonly = false, disabled = false } = options
      setReadonly(readonly)
      setDisabled(disabled)
      let status: any = s
      if (typeof s === 'function') {
        try {
          setInitLoading(true)
          status = await s()
          setInitLoading(false)
        } catch {
          setInitLoading(false)
        }
      }
      setShowModal(status)
      if (!status) {
        form.resetFields()
      }
      if (typeof status === 'object') {
        form.setValues(status)
      }
    },
    [setShowModal, form, setInitLoading],
  )

  const onCancel = useCallback(() => {
    setShowModal(false)
    form.resetFields()
    setLoading(false)
    setReadonly(false)
  }, [setShowModal, form, setLoading])

  const handleSubmit = useCallback(
    async values => {
      setLoading(true)
      try {
        if (typeof showModal === 'object') {
          await onEdit?.(showModal[idKey], values, showModal)
          message.success('编辑成功')
        } else {
          await onCreate?.(values)
          message.success('新增成功')
        }
        onCancel()
      } catch (error) {
        setLoading(false)
      }
    },
    [setLoading, onCancel, onEdit, onCreate, showModal],
  )

  return (
    <Modal
      width={600}
      title={title}
      open={!!showModal}
      onOk={form.submit}
      okText={okText}
      okButtonProps={{ loading }}
      onCancel={onCancel}
      footer={readonly ? null : undefined}
    >
      <Spin spinning={initLoading}>
        <FormRender
          form={form}
          readOnly={readonly}
          disabled={disabled}
          schema={schema}
          onFinish={handleSubmit}
          onValuesChange={onValuesChange}
        />
      </Spin>
    </Modal>
  )
}

export default forwardRef(CommonEditModal)
