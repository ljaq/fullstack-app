import { Modal, Spin } from 'antd'
import { SchemaBase } from 'form-render'
import { forwardRef, useCallback, useImperativeHandle, useMemo, useState } from 'react'
import FormRender, { useForm } from '../FormRender'

interface IProps {
  name: string
  schema: SchemaBase
  onEdit?: (values: any, orgValues: any) => Promise<void>
  onCreate?: (values: any) => Promise<void>
  onValuesChange?: (values: any) => void
  labelWidth?: number | string
  idKey?: string
}

export interface CommonEditModalInstance {
  setModalStatus: (status: boolean | any, readonly?: boolean) => void
}

function CommonEditModal(props: IProps, ref) {
  const { name, onCreate, onEdit, schema, idKey = 'id', onValuesChange } = props
  const [showModal, setShowModal] = useState<boolean | any>(false)
  const [readonly, setReadonly] = useState(false)
  const [loading, setLoading] = useState(false)
  const [initLoading, setInitLoading] = useState(false)
  const form = useForm()

  const title = useMemo(() => {
    if (readonly) return `${name}详情`
    return typeof showModal === 'object' ? `编辑${name}` : `新增${name}`
  }, [name, readonly, showModal])

  useImperativeHandle(ref, () => {
    return {
      setModalStatus,
    }
  })

  const setModalStatus = useCallback(
    async (s: any, readonly = false) => {
      setReadonly(readonly)
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
          await onEdit?.({ ...values, [idKey]: showModal[idKey] }, showModal)
        } else {
          await onCreate?.(values)
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
      okButtonProps={{ loading }}
      onCancel={onCancel}
    >
      <Spin spinning={initLoading}>
        <FormRender
          form={form}
          disabled={readonly}
          schema={schema}
          onFinish={handleSubmit}
          onValuesChange={onValuesChange}
        />
      </Spin>
    </Modal>
  )
}

export default forwardRef(CommonEditModal)
