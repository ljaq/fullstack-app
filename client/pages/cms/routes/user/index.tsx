import { Button, Modal, Select, Space, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useEffect, useState } from 'react'
import { request } from 'api'

type UserItem = {
  id: number
  username: string
  roles: string[]
}

type RoleItem = {
  id: number
  name: string
}

export default function UserPage() {
  const [users, setUsers] = useState<UserItem[]>([])
  const [roles, setRoles] = useState<RoleItem[]>([])
  const [loading, setLoading] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<UserItem | null>(null)
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([])

  const load = async () => {
    setLoading(true)
    try {
      const [userRes, roleRes] = await Promise.all([request.jaq.rbac.user.get(), request.jaq.rbac.role.get()])
      setUsers(userRes.data || [])
      setRoles(roleRes.data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

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
          <Button
            type='link'
            onClick={() => {
              setCurrentUser(record)
              const roleIds = roles.filter(r => record.roles?.includes(r.name)).map(r => r.id)
              setSelectedRoleIds(roleIds)
              setAssignOpen(true)
            }}
          >
            分配角色
          </Button>
        </Space>
      ),
    },
  ]

  const handleSave = async () => {
    if (!currentUser) return
    await request.jaq.rbac.user.post({
      query: { id: String(currentUser.id) },
      body: { roleIds: selectedRoleIds },
    })
    setAssignOpen(false)
    setCurrentUser(null)
    load()
  }

  return (
    <div>
      <Table rowKey='id' loading={loading} dataSource={users} columns={columns} pagination={false} />

      <Modal
        open={assignOpen}
        title={currentUser ? `分配角色 - ${currentUser.username}` : '分配角色'}
        onOk={handleSave}
        onCancel={() => setAssignOpen(false)}
      >
        <Select
          style={{ width: '100%' }}
          mode='multiple'
          placeholder='请选择角色'
          value={selectedRoleIds}
          options={roles.map(r => ({ label: r.name, value: r.id }))}
          onChange={vals => setSelectedRoleIds(vals)}
        />
      </Modal>
    </div>
  )
}
