import { HomeOutlined } from '@ant-design/icons'
import CommonTable from '../../components/CommonTable'
import { IFormItem } from '../../utils/getFormItem'
import { ColumnsType } from 'antd/es/table'

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

  return <CommonTable toolList={toolList} columns={columns} request={() => Promise.resolve([])} />
}

export const pageConfig = {
  name: 'Home',
  icon: <HomeOutlined />,
}
