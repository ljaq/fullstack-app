import { EntitySchema } from 'typeorm'

export interface User {
  id: number
  username: string
  passwordHash: string
  createdAt: Date
  updatedAt: Date
  /** 角色编码（与 Role.role 一致），非 id */
  roles: string[]
}

export const UserEntity = new EntitySchema<User>({
  name: 'User',
  tableName: 'User',
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    username: {
      type: String,
      unique: true,
    },
    passwordHash: {
      type: String,
    },
    createdAt: {
      type: 'datetime',
      createDate: true,
    },
    updatedAt: {
      type: 'datetime',
      updateDate: true,
    },
    roles: {
      type: 'simple-array',
      nullable: true,
    },
  },
})


