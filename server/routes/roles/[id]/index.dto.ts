import * as z from 'zod'
import { roleBody } from '../index.dto'

export const paramSchema = z.object({ id: z.coerce.number().int() })

export { roleBody }
