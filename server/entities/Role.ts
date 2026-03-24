import { EntitySchema } from 'typeorm'

export interface Role {
  id: number
  roleName: string
  role: string
  description?: string
  createdAt: string
  updatedAt: string
  pages?: string[]
  buttons?: string[]
}

export const RoleEntity = new EntitySchema<Role>({
  name: 'Role',
  tableName: 'Role',
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    /** 角色名 */
    roleName: {
      type: String,
      unique: true,
    },
    /** 角色编码（旧库同步时可为空一帧，启动后由 db 回填） */
    role: {
      type: String,
      unique: true,
      nullable: true,
    },
    /** 角色描述 */
    description: {
      type: 'text',
      nullable: true,
    },
    /** 创建时间 */
    createdAt: {
      type: 'datetime',
      createDate: true,
    },
    /** 更新时间 */
    updatedAt: {
      type: 'datetime',
      updateDate: true,
    },
    /** 页面权限 */
    pages: {
      type: 'simple-array',
      nullable: true,
    },
    /** 按钮权限 */
    buttons: {
      type: 'simple-array',
      nullable: true,
    },
  },
})


