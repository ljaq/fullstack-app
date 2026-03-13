import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'

// 默认使用本地 SQLite，连接字符串来自 DATABASE_URL
dotenv.config({ path: `.env.${process.env.mode || 'development'}` })

export const prisma = new PrismaClient()

