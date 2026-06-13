import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding owner account...')

  // Create owner user
  const owner = await prisma.user.upsert({
    where: { email: 'owner@bookflow.os' },
    update: {},
    create: {
      name: 'BookFlow Owner',
      email: 'owner@bookflow.os',
      password: 'Owner@2025',
      role: 'owner',
      isActive: true,
      isViewOnly: false,
    },
  })

  console.log(`✅ Owner user created: ${owner.email}`)

  // Create a universal serial key for owner device activation
  const serialKey = await prisma.serialKey.upsert({
    where: { key: 'BFOWN-2025-PROF-UNLM' },
    update: {},
    create: {
      key: 'BFOWN-2025-PROF-UNLM',
      plan: 'enterprise',
      maxDevices: 999,
      isActive: true,
      activatedAt: new Date(),
      expiresAt: new Date('2030-12-31'),
    },
  })

  console.log(`✅ Owner serial key created: ${serialKey.key}`)
  console.log('')
  console.log('═══════════════════════════════════════════════')
  console.log('  🔑 OWNER CREDENTIALS')
  console.log('═══════════════════════════════════════════════')
  console.log(`  Email:    owner@bookflow.os`)
  console.log(`  Password: Owner@2025`)
  console.log(`  Role:     owner`)
  console.log('───────────────────────────────────────────────')
  console.log('  🔐 SERIAL KEY (for device activation)')
  console.log('───────────────────────────────────────────────')
  console.log(`  Key:  BFOWN-2025-PROF-UNLM`)
  console.log(`  Plan: Enterprise (Unlimited)`)
  console.log('═══════════════════════════════════════════════')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
