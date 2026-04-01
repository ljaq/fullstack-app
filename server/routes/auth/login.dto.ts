import * as z from 'zod'

export const loginBody = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
})
