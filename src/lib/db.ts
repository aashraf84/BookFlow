import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Resolve the correct DATABASE_URL — prefer the PostgreSQL Neon URL
// The system env may have a SQLite path; we need the PostgreSQL one
function getDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL
  // If it's a PostgreSQL URL, use it directly
  if (envUrl && (envUrl.startsWith('postgresql://') || envUrl.startsWith('postgres://'))) {
    return envUrl
  }
  // If it's a SQLite or file URL, fall back to the Neon connection
  return 'postgresql://neondb_owner:npg_q4xrafHlO6Sk@ep-lucky-river-atm2i8s7-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require'
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: [],
    datasourceUrl: getDatabaseUrl(),
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// ─── Auto-seed on cold start ────────────────────────────────
// Ensures owner + serial key + demo user + default tenant
// always exist when the first auth request comes in.
let _seeded = false

export async function ensureSeedData() {
  if (_seeded) return
  _seeded = true

  try {
    // Check if SerialKey table has data
    const keyCount = await db.serialKey.count()

    if (keyCount === 0) {
      console.log('🌱 Auto-seeding: Fresh database detected, creating seed data...')

      // 1. Create default tenant (the bookstore company)
      const defaultTenant = await db.tenant.create({
        data: {
          name: 'ApexFlow HQ',
          slug: 'apexflow-hq',
          email: 'admin@apexflow.cloud',
          industry: 'Bookstore Management',
          status: 'active',
          plan: 'enterprise',
          maxUsers: 999,
          maxBranches: 999,
          currency: 'USD',
          timezone: 'UTC',
        },
      })

      // 2. Create owner user (belongs to default tenant)
      await db.user.create({
        data: {
          name: 'ApexFlow Admin',
          email: 'admin@apexflow.cloud',
          password: 'Admin@180H',
          role: 'owner',
          isActive: true,
          isViewOnly: false,
          tenantId: defaultTenant.id,
        },
      })

      // 3. Create serial keys
      await db.serialKey.createMany({
        data: [
          {
            key: 'BFOWN-2025-PROF-UNLM',
            plan: 'enterprise',
            maxDevices: 999,
            isActive: true,
            activatedAt: new Date(),
            expiresAt: new Date('2030-12-31'),
          },
          {
            key: 'BF-TRIAL-2027-XXXX',
            plan: 'trial',
            maxDevices: 1,
            isActive: true,
            expiresAt: new Date('2027-12-31'),
          },
          {
            key: 'BF-STD-2027-XXXX',
            plan: 'standard',
            maxDevices: 3,
            isActive: true,
            expiresAt: new Date('2027-12-31'),
          },
          {
            key: 'BF-PRO-2027-XXXX',
            plan: 'professional',
            maxDevices: 10,
            isActive: true,
            expiresAt: new Date('2027-12-31'),
          },
          {
            key: 'BF-ENT-2027-XXXX',
            plan: 'enterprise',
            maxDevices: 999,
            isActive: true,
            expiresAt: new Date('2030-12-31'),
          },
        ],
      })

      // 4. Create demo user (belongs to default tenant)
      await db.user.create({
        data: {
          name: 'Demo User',
          email: 'demo@bookflow.os',
          password: 'demo123',
          role: 'demo',
          isActive: true,
          isViewOnly: true,
          tenantId: defaultTenant.id,
        },
      })

      console.log('✅ Auto-seed complete: Tenant + Owner + Serial Keys + Demo user created')
    }
  } catch (error) {
    console.error('Auto-seed error (non-fatal):', error)
    // Reset seeded flag so it retries on next request
    _seeded = false
  }
}
