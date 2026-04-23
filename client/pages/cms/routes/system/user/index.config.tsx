import { request } from 'api'
import { Schema } from 'form-render'

export const meta = {
  name: '用户管理',
  order: 0,
}

export const searchSchema: Schema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      title: '用户名',
      placeholder: '请输入用户名',
    },
  },
}

export const createSchema: Schema = {
  type: 'object',
  displayType: 'row',
  properties: {
    username: {
      type: 'string',
      title: '用户名',
      placeholder: '请输入用户名',
      required: true,
    },
    password: {
      type: 'string',
      title: '密码',
      props: {
        placeholder: '新增必填；编辑时留空表示不修改',
      },
    },
    roles: {
      type: 'array',
      title: '角色',
      widget: 'pageSelector',
      required: true,
      props: {
        url: request.app.roles.url,
        placeholder: '请选择角色',
        labelKey: 'roleName',
        valueKey: 'role',
        mode: 'multiple',
      },
    },
  },
}
