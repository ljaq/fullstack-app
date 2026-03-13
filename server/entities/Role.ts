import { EntitySchema } from 'typeorm'

export interface Role {
  id: number
  name: string
  description: string | null
  createdAt: Date
  updatedAt: Date
  pages: string | null
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
    name: {
      type: String,
      unique: true,
    },
    description: {
      type: 'text',
      nullable: true,
    },
    createdAt: {
      type: 'datetime',
      createDate: true,
    },
    updatedAt: {
      type: 'datetime',
      updateDate: true,
    },
    pages: {
      type: 'text',
      nullable: true,
    },
  },
})


