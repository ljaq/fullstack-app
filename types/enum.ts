import { Enum } from 'utils/enum'

export const Role = Enum({
  ADMIN: { label: '管理员', value: 'manager' },
} as const)
