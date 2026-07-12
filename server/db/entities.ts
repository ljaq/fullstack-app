import { UserEntity } from '../entities/User'
import { RoleEntity } from '../entities/Role'

/** 新增实体后在此注册（避免在会被 Vite 配置打包的文件中使用 import.meta.glob） */
export const entities = [UserEntity, RoleEntity]
