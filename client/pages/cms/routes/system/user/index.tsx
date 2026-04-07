import { Button, message, Space, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useRef } from 'react'
import { request } from 'api'
import CommonTable, { CommonTableInstance } from 'client/components/CommonTable'
import CommonEditModal, { CommonEditModalInstance } from 'client/components/CommonEditModal'
import { createSchema, searchSchema } from './index.config'
import EasyModal from 'client/utils/easyModal'
import CommonConfirmModal from 'client/modals/CommonConfirmModal'
import { useNavigate } from 'react-router'

type UserItem = {
  id: number
  username: string
  roles: string[]
  roleNames?: string[]
}

const idPath = ':id' as const

export default function UserPage() {
  const navigate = useNavigate()
  const tableRef = useRef<CommonTableInstance>(null)
  const modelRef = useRef<CommonEditModalInstance>(null)

  const columns: ColumnsType<UserItem> = [
    { title: '用户名', dataIndex: 'username' },
    {
      title: '角色',
      dataIndex: 'roleNames',
      render: (val: string[]) => (
        <Space>
          {val.map(name => (
            <Button
              size='small'
              variant='filled'
              color='default'
              key={name}
              onClick={() => navigate(`/cms/system/role?name=${name}`)}
            >
              {name}
            </Button>
          ))}
        </Space>
      ),
    },
    {
      title: '操作',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type='link'
            onClick={() => {
              modelRef.current?.show({
                ...record,
                password: '',
              })
            }}
          >
            编辑
          </Button>
          <Button
            type='link'
            danger
            onClick={async () => {
              EasyModal.show(CommonConfirmModal, {
                tip: '确定$删除$该用户吗？',
                onOk: async () => {
                  await request.jaq.users[idPath].delete({
                    params: { id: String(record.id) },
                  })
                },
              }).then(() => tableRef.current?.fetchData())
            }}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ]

  const handleCreateUser = async (values: any) => {
    const { username, password, roles: roleCodes } = values
    if (!password) {
      message.warning('请填写密码')
      throw new Error('请填写密码')
    }
    await request.jaq.users.post({
      body: { username, password, roles: roleCodes ?? [] },
    })
    tableRef.current?.fetchData()
  }

  const handleEditUser = async (_id: string | number, values: any) => {
    const body: { username?: string; password?: string; roles?: string[] } = {
      username: values.username,
      roles: values.roles ?? [],
    }
    if (values.password) {
      body.password = values.password
    }
    await request.jaq.users[idPath].put({
      params: { id: String(_id) },
      body,
    })
    tableRef.current?.fetchData()
  }

  return (
    <div>
      <CommonTable
        tableTitle='用户管理'
        ref={tableRef}
        search={{ schema: searchSchema }}
        request={request.jaq.users}
        columns={columns}
        extra={
          <Button loading type='primary' onClick={() => modelRef.current?.show(true)}>
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
