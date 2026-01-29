import { HomeOutlined } from '@ant-design/icons'
import CommonTable from 'client/components/CommonTable'
import { ColumnsType } from 'antd/es/table'
import { Schema } from 'form-render'
import { IRequest } from 'types'
import { API_REQ_FUNCTION } from 'client/api/types'

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

  return (
    <CommonTable
      search={{ schema }}
      columns={columns}
      request={(() => Promise.resolve({ data: [], total: 0, success: true, message: '' })) as API_REQ_FUNCTION<any>}
    />
  )
}

Home.pageConfig = {
  name: 'Home',
  order: 0,
  icon: <HomeOutlined />,
}
