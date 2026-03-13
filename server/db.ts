import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { UserEntity } from './entities/User'
import { RoleEntity } from './entities/Role'

const isProd = process.env.mode === 'production' || process.env.NODE_ENV === 'production'
const database = isProd ? 'prod.db' : 'dev.db'

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database,
  entities: [UserEntity, RoleEntity],
  synchronize: true,
  logging: false,
})

let dataSource: DataSource | null = null

export async function getDataSource() {
  if (dataSource && dataSource.isInitialized) return dataSource
  dataSource = await AppDataSource.initialize()
  return dataSource
}

