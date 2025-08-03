import Form, { FRProps } from 'form-render'
import CommonUpload from '../CommonUpload'

export * from 'form-render'
export default function FormRender(props: FRProps) {
  return (
    <Form
      labelWidth={120}
      widgets={{
        CommonUpload,
      }}
      {...props}
    />
  )
}
