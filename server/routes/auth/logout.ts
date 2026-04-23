import { createFactory } from 'hono/factory'

const factory = createFactory()

/** 登出（客户端清除本地 token；无状态 JWT 无需服务端使会话失效） */
export const POST = factory.createHandlers(c => c.json({ success: true }))
