import type { Validation } from '@hono/typia-validator'
import typia, { tags } from 'typia'

export interface CreateBody {
  username: string & tags.MinLength<3> & tags.MaxLength<32>
  password: string & tags.MinLength<6> & tags.MaxLength<128>
  roles?: Array<string & tags.MinLength<1>>
}

export const createBody: Validation<CreateBody> = typia.createValidate<CreateBody>()
