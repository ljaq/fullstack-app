import * as z from 'zod'

export const roleBody = z.object({
  roleName: z.string().min(1),
  role: z.string().min(1),
  description: z.string().optional(),
})
