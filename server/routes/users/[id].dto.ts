import * as z from 'zod'

export const paramSchema = z.object({ id: z.coerce.number().int() })

export const updateBody = z.object({
  username: z.string().min(3).max(32).optional(),
  password: z.string().min(6).max(128).optional(),
  roles: z.array(z.string().min(1)).optional(),
})
