import { HomeOutlined } from '@ant-design/icons'
import CommonTable from 'client/components/CommonTable'
import { IFormItem } from 'client/utils/getFormItem'
import { ColumnsType } from 'antd/es/table'
import { Schema } from 'form-render'

const toolList: IFormItem[] = [
  {
    type: 'input',
    name: 'name',
    label: '姓名',
  },
  {
    type: 'input',
    name: 'age',
    label: '年龄',
  },
  {
    type: 'input',
    name: 'address',
    label: '地址',
  },
]

const schema: Schema = {
  type: 'object',
  displayType: 'row',
  properties: {
    name: {
      type: 'string',
      title: '姓名',
      widget: 'input',
    },
    age: {
      type: 'number',
      title: '年龄',
    },
    address: {
      type: 'string',
      title: '地址',
    },
    date: {
      type: 'range',
      title: '日期',
      widget: 'dateRange',
    },
  },
}

export default function Home() {
  const columns: ColumnsType = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '年龄',
      dataIndex: 'age',
      key: 'age',
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
    },
  ]

  return <CommonTable search={{ schema }} columns={columns} request={() => Promise.resolve([])} />
}

Home.pageConfig = {
  name: 'Home',
  order: 0,
  icon: <HomeOutlined />,
}
