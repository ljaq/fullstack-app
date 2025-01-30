import {
  Cascader,
  CascaderProps,
  DatePicker,
  DatePickerProps,
  Form,
  FormItemProps,
  Input,
  InputNumber,
  InputNumberProps,
  InputProps,
  Radio,
  RadioProps,
  Select,
  SelectProps,
} from 'antd'
import CommonUpload, { CommonUploadProps } from '../components/CommonUpload'
import { formatTime } from './time'
import dayjs from 'dayjs'
import { TextAreaProps } from 'antd/es/input'

type FormItemChildrenProps = {
  input: InputProps
  textarea: TextAreaProps
  inputNumber: InputNumberProps
  date: DatePickerProps
  select: SelectProps
  dateMonth: DatePickerProps
  textArea: InputProps
  cascader: CascaderProps
  upload: CommonUploadProps
  radio: RadioProps
}

export interface IFormItem extends FormItemProps {
  type: keyof FormItemChildrenProps
  name: string
  childrenProps?: FormItemChildrenProps[IFormItem['type']]
}

const formItemMap: { [key in keyof FormItemChildrenProps]: React.ComponentType<any> } = {
  input: Input,
  textarea: Input.TextArea,
  inputNumber: InputNumber,
  date: DatePicker.RangePicker,
  select: Select,
  dateMonth: DatePicker.MonthPicker,
  textArea: Input.TextArea,
  cascader: Cascader,
  upload: CommonUpload,
  radio: Radio.Group,
}

export const formatQuery = (query: { [key: string]: any }, toolList: IFormItem[]) => {
  const _query = { ...query }
  toolList?.forEach(item => {
    const value = _query[item.name]
    if (value === undefined || value === null || value === '') {
      delete _query[item.name]
      return
    }
    if (item.type === 'date') {
      _query[`${item.name}Min`] =
        value[0] &&
        formatTime(value[0], `YYYY-MM-DDT${(item.childrenProps as any)?.showTime ? 'HH:mm:ss' : '00:00:00'}`)
      _query[`${item.name}Max`] =
        value[1] &&
        formatTime(value[1], `YYYY-MM-DDT${(item.childrenProps as any)?.showTime ? 'HH:mm:ss' : '23:59:59'}`)
      delete _query[item.name]
    } else if (item.type === 'cascader') {
      const res = _query?.[item.name] || []
      _query[item.name] = res[res.length - 1]
    }
  })
  return _query
}

export const formatFormValue = (value: { [key: string]: any }, toolList: IFormItem[]) => {
  const _value = { ...value }
  toolList?.forEach(item => {
    if (item.type === 'date') {
      _value[item.name] = [
        _value[`${item.name}Min`] && dayjs(_value[`${item.name}Min`]),
        _value[`${item.name}Max`] && dayjs(_value[`${item.name}Max`]),
      ]
      delete _value[`${item.name}Min`]
      delete _value[`${item.name}Max`]
      console.log(_value)
    }
  })
  return _value
}

export function getFormItem(conf: IFormItem) {
  const Field = formItemMap[conf.type]
  const props = {
    style: { width: '100%' },
    ...conf.childrenProps,
  }

  return (
    <Form.Item {...conf} name={conf.name}>
      <Field allowClear placeholder={`请输入${conf.label}`} {...props} />
    </Form.Item>
  )
}
