import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// ─── Auto-seed on first run ─────────────────────────────────
// Ensures owner account + serial key exist even on fresh deployments
let _seeded = false

export async function ensureSeedData() {
  if (_seeded) return
  _seeded = true

  try {
    // Check if owner already exists
    const existingOwner = await db.user.findFirst({
      where: { role: 'owner' },
    })

    if (!existingOwner) {
      console.log('🌱 Auto-seeding: Creating owner account & serial key...')

      await db.user.create({
        data: {
          name: 'ApexFlow Admin',
          email: 'admin@apexflow.cloud',
          password: 'Admin@180H',
          role: 'owner',
          isActive: true,
          isViewOnly: false,
        },
      })

      await db.serialKey.create({
        data: {
          key: 'BFOWN-2025-PROF-UNLM',
          plan: 'enterprise',
          maxDevices: 999,
          isActive: true,
          activatedAt: new Date(),
          expiresAt: new Date('2030-12-31'),
        },
      })

      console.log('✅ Auto-seed complete: Owner + Serial Key created')
    }

    // Ensure demo user exists
    const existingDemo = await db.user.findFirst({
      where: { role: 'demo' },
    })

    if (!existingDemo) {
      await db.user.create({
        data: {
          name: 'Demo User',
          email: 'demo@bookflow.os',
          password: 'demo123',
          role: 'demo',
          isActive: true,
          isViewOnly: true,
        },
      })
      console.log('✅ Auto-seed complete: Demo user created')
    }
  } catch (error) {
    console.error('Auto-seed error (non-fatal):', error)
  }
}
