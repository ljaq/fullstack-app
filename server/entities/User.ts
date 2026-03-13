import { EntitySchema } from 'typeorm'

export interface User {
  id: number
  username: string
  passwordHash: string
  createdAt: Date
  updatedAt: Date
  roles: string | null
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
      type: 'text',
      nullable: true,
    },
  },
})


