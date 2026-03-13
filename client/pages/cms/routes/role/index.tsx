import { Button, Form, Input, Modal, Space, Table, Tree } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useEffect, useMemo, useState } from 'react'
import { request } from 'api'
import routes from 'client/pages/cms/routes/_route.gen'

type Role = {
  id: number
  name: string
  description?: string
}

type PageNode = {
  key: string
  title: string
  order: number
  children?: PageNode[]
}

const parseRoutesToTree = (route, prefix = ''): PageNode | null => {
  let { path, meta, children } = route
  const fullPath = [prefix, path].filter(p => p).join('/')

  if (children && children[0]?.path === '') {
    if (!meta) {
      meta = children[0].meta
    }
    children = children.slice(1)
  }

  if (!meta?.name) {
    if (!children?.length) return null
  }

  const node: PageNode = {
    key: `/${fullPath}`,
    order: meta?.order || 0,
    title: meta?.name || fullPath || '/',
  }

  if (children?.length) {
    node.children = children.map(child => parseRoutesToTree(child, fullPath)).filter(Boolean) as PageNode[]
  }

  return node
}

const buildPageTree = (): PageNode[] => {
  const root = routes[0]
  const children = root?.children || []
  return children
    .map(child => parseRoutesToTree(child, 'cms'))
    .filter(Boolean)
    .sort((a, b) => a!.order - b!.order) as PageNode[]
}

export default function RolePage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Role | null>(null)
  const [form] = Form.useForm()

  const [menuModalOpen, setMenuModalOpen] = useState(false)
  const [menuRole, setMenuRole] = useState<Role | null>(null)
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([])
  const [menuLoading, setMenuLoading] = useState(false)

  const pageTreeData = useMemo(() => buildPageTree(), [])

  const loadRoles = async () => {
    setLoading(true)
    try {
      const res = (await request.jaq.rbac.role.get()) as { data?: Role[] }
      setRoles(res.data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRoles()
  }, [])

  const columns: ColumnsType<Role> = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: '角色名', dataIndex: 'name' },
    { title: '描述', dataIndex: 'description' },
    {
      title: '操作',
      width: 220,
      render: (_, record) => (
        <Space>
          <Button
            type='link'
            onClick={() => {
              setEditing(record)
              form.setFieldsValue(record)
              setModalOpen(true)
            }}
          >
            编辑
          </Button>
          <Button
            type='link'
            onClick={() => {
              setMenuRole(record)
              openMenuModal(record)
            }}
          >
            菜单权限
          </Button>
          <Button
            type='link'
            danger
            onClick={async () => {
              await request.jaq.rbac.role.delete({
                query: { id: String(record.id) },
              })
              loadRoles()
            }}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ]

  const openMenuModal = async (role: Role) => {
    setMenuModalOpen(true)
    setMenuLoading(true)
    try {
      const res = (await request.jaq.rbac.role.menus.get({
        query: { id: String(role.id) },
      })) as { pageKeys?: string[] }
      setCheckedKeys(res.pageKeys || [])
    } finally {
      setMenuLoading(false)
    }
  }

  const handleSaveRole = async () => {
    const values = await form.validateFields()
    if (editing) {
      await request.jaq.rbac.role.put({
        query: { id: String(editing.id) },
        body: values,
      })
    } else {
      await request.jaq.rbac.role.post({
        body: values,
      })
    }
    setModalOpen(false)
    setEditing(null)
    form.resetFields()
    loadRoles()
  }

  const handleSaveMenus = async () => {
    if (!menuRole) return
    await request.jaq.rbac.role.menus.post({
      query: { id: String(menuRole.id) },
      body: { pageKeys: checkedKeys as string[] },
    })
    setMenuModalOpen(false)
    setMenuRole(null)
  }

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button
          type='primary'
          onClick={() => {
            setEditing(null)
            form.resetFields()
            setModalOpen(true)
          }}
        >
          新建角色
        </Button>
      </Space>
      <Table rowKey='id' loading={loading} dataSource={roles} columns={columns} pagination={false} />

      <Modal
        open={modalOpen}
        title={editing ? '编辑角色' : '新建角色'}
        onOk={handleSaveRole}
        onCancel={() => {
          setModalOpen(false)
          setEditing(null)
        }}
      >
        <Form form={form} layout='vertical'>
          <Form.Item name='name' label='角色名' rules={[{ required: true, message: '请输入角色名' }]}>
            <Input />
          </Form.Item>
          <Form.Item name='description' label='描述'>
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={menuModalOpen}
        title={menuRole ? `配置菜单权限 - ${menuRole.name}` : '配置菜单权限'}
        onOk={handleSaveMenus}
        onCancel={() => setMenuModalOpen(false)}
        width={480}
        confirmLoading={menuLoading}
      >
        <Tree
          checkable
          treeData={pageTreeData}
          checkedKeys={checkedKeys}
          onCheck={keys => setCheckedKeys(keys as React.Key[])}
        />
      </Modal>
    </div>
  )
}
