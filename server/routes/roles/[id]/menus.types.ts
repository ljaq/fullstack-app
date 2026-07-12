import type { Validation } from '@hono/typia-validator'
import typia from 'typia'
import type { BtnPermissionCode } from 'types/permissions'

export interface MenusBody {
  pageKeys: string[]
  buttons?: BtnPermissionCode[]
}

export const menusBody: Validation<MenusBody> = typia.createValidate<MenusBody>()
