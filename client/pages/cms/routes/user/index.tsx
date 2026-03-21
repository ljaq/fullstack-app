import { Button, Space } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useRef } from 'react'
import { request } from 'api'
import CommonTable, { CommonTableInstance } from 'client/components/CommonTable'
import CommonEditModal, { CommonEditModalInstance } from 'client/components/CommonEditModal'
import { createSchema, searchSchema } from './index.config'

type UserItem = {
  id: number
  username: string
  roles: string[]
}

export default function UserPage() {
  const tableRef = useRef<CommonTableInstance>(null)
  const modelRef = useRef<CommonEditModalInstance>(null)

  const columns: ColumnsType<UserItem> = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: '用户名', dataIndex: 'username' },
    {
      title: '角色',
      dataIndex: 'roles',
      render: (roles: string[]) => roles?.join(', '),
    },
    {
      title: '操作',
      width: 160,
      render: (_, record) => (
        <Space>
          <Button type='link' onClick={() => {}}>
            分配角色
          </Button>
        </Space>
      ),
    },
  ]

  const handleCreateUser = async (values: any) => {
    await request.jaq.rbac.user.post({
      body: values,
    })
    tableRef.current?.fetchData()
  }

  const handleEditUser = async (id: string, values: any) => {
    await request.jaq.rbac.user.put({
      query: { id },
      body: values,
    })
    tableRef.current?.fetchData()
  }

  return (
    <div>
      <CommonTable
        tableTitle='用户管理'
        ref={tableRef}
        search={{ schema: searchSchema }}
        request={request.jaq.rbac.user}
        columns={columns}
        extra={
          <Button type='primary' onClick={() => modelRef.current?.show(true)}>
            新建
          </Button>
        }
      />
      <CommonEditModal
        ref={modelRef}
        name='用户'
        schema={createSchema}
        onCreate={handleCreateUser}
        onEdit={handleEditUser}
      />
    </div>
  )
}
