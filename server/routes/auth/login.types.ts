import type { Validation } from '@hono/typia-validator'
import typia, { tags } from 'typia'

export interface LoginBody {
  username: string & tags.MinLength<1>
  password: string & tags.MinLength<1>
}

export const loginBody: Validation<LoginBody> = typia.createValidate<LoginBody>()
