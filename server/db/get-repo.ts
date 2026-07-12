import { getDataSource } from './data-source'
import type { EntitySchema } from 'typeorm'

export async function getRepo<T extends object>(entity: EntitySchema<T>) {
  const ds = await getDataSource()
  return ds.getRepository(entity)
}
