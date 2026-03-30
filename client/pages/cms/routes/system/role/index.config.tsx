import { Schema } from 'form-render'

export const meta = {
  name: '角色管理',
  order: 1,
}

export const searchSchema: Schema = {
  type: 'object',
  displayType: 'row',
  properties: {
    name: {
      type: 'string',
      title: '角色名',
      placeholder: '请输入角色名',
      widget: 'input',
    },
  },
}

export const createSchema: Schema = {
  type: 'object',
  displayType: 'row',
  properties: {
    roleName: {
      type: 'string',
      title: '角色名',
      required: true,
      placeholder: '请输入角色名',
      widget: 'input',
    },
    role: {
      type: 'string',
      title: '角色编码',
      required: true,
      placeholder: '请输入角色编码',
      widget: 'input',
    },
    description: {
      type: 'string',
      title: '描述',
      required: true,
      placeholder: '请输入描述',
      widget: 'textArea',
    },
  },
}
