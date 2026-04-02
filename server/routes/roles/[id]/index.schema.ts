import * as z from 'zod'
import { roleBody } from '../index.schema'

export const paramSchema = z.object({ id: z.coerce.number().int() })

export { roleBody }
