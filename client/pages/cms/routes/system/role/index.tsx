import { Alert, App, Button, Card, Checkbox, Col, Row, Space, Tree } from 'antd'
import type { DataNode } from 'antd/es/tree'
import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { request } from 'api'
import routes from 'client/pages/cms/routes/_route.gen'
import { useQuery } from '@tanstack/react-query'
import { useStyle } from './style'
import { Role } from 'server/entities/Role'
import { meta, createSchema } from './index.config'
import { useAuthority } from 'client/hooks/useAuthority'
import { CheckOutlined, DeleteOutlined, EditOutlined, PlusOutlined, UndoOutlined } from '@ant-design/icons'
import CommonEditModal, { CommonEditModalInstance } from 'client/components/CommonEditModal'
import EasyModal from 'client/utils/easyModal'
import CommonConfirmModal from 'client/modals/CommonConfirmModal'
import { BTN, BtnPermissionCode } from 'types'

type PageNode = {
  key: string
  title: string
  order: number
  /** 该页面下的按钮权限（横向展示在节点标题下方） */
  buttons?: { key: string; label: string }[]
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

  const node: PageNode = {
    key: `/${fullPath}`,
    order: meta?.order || 0,
    title: meta?.name || fullPath || '/',
  }

  const buttons = BTN[meta.name as keyof typeof BTN]
  if (buttons) {
    const opts: { key: string; label: string }[] = []
    for (const [actionName, permKey] of Object.entries(buttons)) {
      if (typeof permKey === 'string') {
        opts.push({ key: permKey, label: actionName })
      }
    }
    if (opts.length) {
      node.buttons = opts
    }
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
  const { message } = App.useApp()
  const { hasAuthority } = useAuthority()
  const { styles, cx } = useStyle()
  const [activeRole, setActiveRole] = useState<Role | null>(null)
  const [currentRoleKeys, setCurrentRoleKeys] = useState<string[]>([])
  const [currentButtonKeys, setCurrentButtonKeys] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const roleModalRef = useRef<CommonEditModalInstance>(null)
  const roleList = useQuery({
    queryKey: ['roleList'],
    queryFn: () => request.jaq.roles.get({}),
  })
  const pageTree = useMemo(() => buildPageTree(), [])

  const treeData = useMemo(() => {
    const mapNode = (n: PageNode): DataNode => ({
      key: n.key,
      title: (
        <div className={styles.treeNodeBlock}>
          <span className={styles.treeNodeTitleText}>{n.title}</span>
          {n.buttons?.length ? (
            <div
              className={styles.treeNodeButtons}
              role='presentation'
              onClick={e => e.stopPropagation()}
              onMouseDown={e => e.stopPropagation()}
            >
              {n.buttons.map(opt => (
                <Checkbox
                  key={opt.key}
                  checked={currentButtonKeys.includes(opt.key)}
                  onChange={e => {
                    const on = e.target.checked
                    setCurrentButtonKeys(prev => (on ? [...prev, opt.key] : prev.filter(k => k !== opt.key)))
                  }}
                >
                  {opt.label}
                </Checkbox>
              ))}
            </div>
          ) : null}
        </div>
      ),
      children: n.children?.map(mapNode),
    })
    return pageTree.map(mapNode)
  }, [pageTree, currentButtonKeys, styles.treeNodeBlock, styles.treeNodeTitleText, styles.treeNodeButtons])

  const isChanged = useMemo(() => {
    const pagesDiff = JSON.stringify(currentRoleKeys) !== JSON.stringify(activeRole?.pages ?? [])
    const buttonsDiff = JSON.stringify(currentButtonKeys) !== JSON.stringify(activeRole?.buttons ?? [])
    return pagesDiff || buttonsDiff
  }, [currentRoleKeys, currentButtonKeys, activeRole])

  const handleRoleClick = item => {
    if (activeRole?.id === item.id) {
      return
    }
    setActiveRole(item)
    setCurrentRoleKeys(item.pages ?? [])
    setCurrentButtonKeys(item.buttons ?? [])
  }

  const handleCreateRole = async (values: any) => {
    await request.jaq.roles.post({
      body: values,
    })
    roleList.refetch()
  }

  const handleEditRole = async (id: string | number, values: any) => {
    await request.jaq.roles[':id'].put({
      params: { id: String(id) },
      body: values,
    })
    roleList.refetch()
  }

  const handleSave = () => {
    setIsSaving(true)
    request.jaq.roles[':id'].menus
      .put({
        params: { id: String(activeRole?.id) },
        body: { pageKeys: currentRoleKeys, buttons: currentButtonKeys as BtnPermissionCode[] },
      })
      .then(() => {
        setActiveRole({
          ...activeRole,
          pages: currentRoleKeys || [],
          buttons: currentButtonKeys as BtnPermissionCode[],
        } as Role)
        setCurrentRoleKeys(currentRoleKeys)
        setCurrentButtonKeys(currentButtonKeys as BtnPermissionCode[])
      })
      .then(() => {
        message.success('设置成功')
        return roleList.refetch()
      })
      .finally(() => {
        setIsSaving(false)
      })
  }

  useEffect(() => {
    const defaultRole = roleList.data?.data[0]
    if (defaultRole && !activeRole) {
      setActiveRole(defaultRole)
      setCurrentRoleKeys(defaultRole.pages ?? [])
      setCurrentButtonKeys(defaultRole.buttons ?? [])
    }
  }, [roleList.data?.data])

  return (
    <Fragment>
      <Row gutter={16} wrap={false}>
        <Col flex='256px'>
          <Card
            title='角色'
            size='small'
            styles={{ body: { height: 'calc(100vh - 130px)', overflowY: 'auto' } }}
            extra={
              hasAuthority(BTN.角色管理.新建) || (
                <Button
                  size='small'
                  variant='filled'
                  color='primary'
                  onClick={() => roleModalRef.current?.show(true)}
                  icon={<PlusOutlined />}
                />
              )
            }
          >
            {roleList.data?.data.map(item => (
              <div
                key={item.id}
                className={cx(styles.roleItem, activeRole?.id === item.id && 'active')}
                onClick={() => handleRoleClick(item)}
              >
                <div>{item.roleName}</div>
                <Space size={4}>
                  <Button
                    size='small'
                    type='text'
                    onClick={() => roleModalRef.current?.show(item)}
                    icon={<EditOutlined />}
                  />
                  <Button
                    size='small'
                    type='text'
                    danger
                    onClick={() =>
                      EasyModal.show(CommonConfirmModal, {
                        tip: '确定$删除$该角色吗？',
                        onOk: async () => {
                          await request.jaq.roles[':id'].delete({
                            params: { id: String(item.id) },
                          })
                        },
                      }).then(() => roleList.refetch())
                    }
                    icon={<DeleteOutlined />}
                  />
                </Space>
              </div>
            ))}
          </Card>
        </Col>
        <Col flex='auto'>
          <Card
            title={activeRole?.roleName}
            size='small'
            styles={{ body: { height: 'calc(100vh - 130px)', overflowY: 'auto' } }}
            extra={
              isChanged && (
                <Space>
                  <Button
                    size='small'
                    color='default'
                    variant='filled'
                    icon={<UndoOutlined />}
                    onClick={() => {
                      setCurrentRoleKeys(activeRole?.pages ?? [])
                      setCurrentButtonKeys(activeRole?.buttons ?? [])
                    }}
                  />
                  <Button
                    size='small'
                    color='primary'
                    variant='filled'
                    onClick={handleSave}
                    loading={isSaving}
                    icon={<CheckOutlined />}
                  />
                </Space>
              )
            }
          >
            <Alert banner title={activeRole?.description} style={{ margin: '-12px -12px 12px -12px' }} />
            <Tree
              className={styles.tree}
              showLine
              checkable
              blockNode
              checkStrictly
              defaultExpandAll
              treeData={treeData}
              selectable={false}
              checkedKeys={currentRoleKeys}
              onCheck={(e: any) => {
                setCurrentRoleKeys(e.checked)
              }}
            />
          </Card>
        </Col>
      </Row>

      <CommonEditModal
        ref={roleModalRef}
        name='角色'
        schema={createSchema}
        onCreate={handleCreateRole}
        onEdit={handleEditRole}
      />
    </Fragment>
  )
}
