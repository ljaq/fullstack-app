import type { ObjectLiteral, Repository } from 'typeorm'

export async function existsBy<T extends ObjectLiteral>(
  repo: Repository<T>,
  field: keyof T & string,
  value: unknown,
): Promise<boolean> {
  const count = await repo.count({ where: { [field]: value } as any })
  return count > 0
}

export async function paginate<T extends ObjectLiteral>(
  repo: Repository<T>,
  alias: string,
  options: {
    skip?: number
    take?: number
    orderBy?: string
    filters?: Array<{ sql: string; params: Record<string, unknown> }>
  },
): Promise<{ items: T[]; total: number }> {
  const { skip = 0, take = 10, orderBy = `${alias}.id`, filters = [] } = options
  const queryBuilder = repo.createQueryBuilder(alias).orderBy(orderBy, 'ASC')

  for (const filter of filters) {
    queryBuilder.andWhere(filter.sql, filter.params)
  }

  const [items, total] = await queryBuilder.skip(skip).take(take).getManyAndCount()
  return { items, total }
}
