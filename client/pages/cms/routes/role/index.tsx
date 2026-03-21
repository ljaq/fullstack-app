import { Button, Modal, Space, Tree } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useMemo, useRef, useState } from 'react'
import { request } from 'api'
import routes from 'client/pages/cms/routes/_route.gen'
import CommonTable, { CommonTableInstance } from 'client/components/CommonTable'
import CommonEditModal, { CommonEditModalInstance } from 'client/components/CommonEditModal'
import { createSchema, searchSchema } from './index.config'
import EasyModal from 'client/utils/easyModal'
import CommonConfirmModal from 'client/modals/CommonConfirmModal'

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
  const tableRef = useRef<CommonTableInstance>(null)
  const modelRef = useRef<CommonEditModalInstance>(null)

  const [menuModalOpen, setMenuModalOpen] = useState(false)
  const [menuRole, setMenuRole] = useState<Role | null>(null)
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([])
  const [menuLoading, setMenuLoading] = useState(false)

  const pageTreeData = useMemo(() => buildPageTree(), [])

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
              modelRef.current?.show(record)
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
              EasyModal.show(CommonConfirmModal, {
                tip: '确定$删除$该角色吗？',
                onOk: async () => {
                  await request.jaq.rbac.role.delete({
                    query: { id: String(record.id) },
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

  const openMenuModal = async (role: Role) => {
    setMenuModalOpen(true)
    setMenuLoading(true)
    try {
      const res = (await request.jaq.rbac.role.menus.get({
        query: { id: role.id },
      })) as { pageKeys?: string[] }
      setCheckedKeys(res.pageKeys || [])
    } finally {
      setMenuLoading(false)
    }
  }

  const handleCreateRole = async (values: any) => {
    await request.jaq.rbac.role.post({
      body: values,
    })
    tableRef.current?.fetchData()
  }

  const handleEditRole = async (id: number, values: any) => {
    await request.jaq.rbac.role.put({
      query: { id },
      body: values,
    })
    tableRef.current?.fetchData()
  }

  const handleSaveMenus = async () => {
    if (!menuRole) return
    await request.jaq.rbac.role.menus.post({
      query: { id: menuRole.id },
      body: { pageKeys: checkedKeys as string[] },
    })
    setMenuModalOpen(false)
    setMenuRole(null)
  }

  return (
    <div>
      <CommonTable
        tableTitle='角色管理'
        ref={tableRef}
        search={{ schema: searchSchema }}
        request={request.jaq.rbac.role}
        columns={columns}
        extra={
          <Button type='primary' onClick={() => modelRef.current?.show(true)}>
            新建
          </Button>
        }
      />

      <CommonEditModal
        ref={modelRef}
        name='角色'
        schema={createSchema}
        onCreate={handleCreateRole}
        onEdit={handleEditRole}
      />

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
