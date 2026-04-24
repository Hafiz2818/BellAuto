// src/lib/db.ts
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// ✅ Connection pool untuk PostgreSQL
const connectionString = `${process.env.DATABASE_URL}`

const pool = new Pool({ connectionString })

// ✅ Adapter untuk PostgreSQL
const adapter = new PrismaPg(pool)

// ✅ Buat PrismaClient dengan pg adapter
export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })

// ✅ Global caching untuk development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}