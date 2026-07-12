import type { Validation } from '@hono/typia-validator'
import typia, { tags } from 'typia'

export interface RegisterBody {
  username: string & tags.MinLength<3> & tags.MaxLength<32>
  password: string & tags.MinLength<6> & tags.MaxLength<128>
}

export const registerBody: Validation<RegisterBody> = typia.createValidate<RegisterBody>()
