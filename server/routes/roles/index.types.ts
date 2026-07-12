import type { Validation } from '@hono/typia-validator'
import typia, { tags } from 'typia'

export interface RoleBody {
  roleName: string & tags.MinLength<1>
  role: string & tags.MinLength<1>
  description?: string
}

export const roleBody: Validation<RoleBody> = typia.createValidate<RoleBody>()
