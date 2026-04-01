import * as z from 'zod'
import { BTN } from 'types/permissions'
import { paramSchema } from './index.dto'

export { paramSchema }

export const buttonPermissionCodeSchema = z.enum(
  Object.values(BTN).flatMap(btn => Object.values(btn)) as [string, ...string[]],
)

export const menusBody = z.object({
  pageKeys: z.array(z.string()),
  buttons: z.array(buttonPermissionCodeSchema).optional(),
})
