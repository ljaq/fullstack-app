import * as z from 'zod'

export const registerBody = z.object({
  username: z.string().min(3).max(32),
  password: z.string().min(6).max(128),
})
