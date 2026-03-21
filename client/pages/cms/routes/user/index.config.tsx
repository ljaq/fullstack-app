import { HomeOutlined } from '@ant-design/icons'
import { request } from 'api'
import { Schema } from 'form-render'

export const meta = {
  name: '用户管理',
  order: 100,
  icon: <HomeOutlined />,
}

export const createSchema: Schema = {
  type: 'object',
  displayType: 'row',
  properties: {
    name: {
      type: 'string',
      title: '姓名',
      required: true,
    },
    roleIds: {
      type: 'array',
      title: '角色',
      widget: 'pageSelector',
      required: true,
      props: {
        url: request.jaq.rbac.role.url,
        labelKey: 'name',
        valueKey: 'id',
        mode: 'multiple',
      }
    }
  },
}
export const searchSchema: Schema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      title: '姓名',
    },
  },
}
