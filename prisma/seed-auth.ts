import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding auth data...\n')

  // ─── Users ────────────────────────────────────────────────────────
  const users = [
    {
      name: 'Admin User',
      email: 'admin@bookflow.os',
      password: 'admin123',
      role: 'admin',
      isViewOnly: false,
    },
    {
      name: 'Sarah Manager',
      email: 'manager@bookflow.os',
      password: 'manager123',
      role: 'manager',
      isViewOnly: false,
    },
    {
      name: 'Demo User',
      email: 'demo@bookflow.os',
      password: 'demo123',
      role: 'demo',
      isViewOnly: true,
    },
  ]

  console.log('📋 Creating users...')
  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        password: u.password,
        role: u.role,
        isViewOnly: u.isViewOnly,
      },
      create: {
        name: u.name,
        email: u.email,
        password: u.password,
        role: u.role,
        isViewOnly: u.isViewOnly,
      },
    })
    console.log(`   ✓ User: ${user.name} (${user.email}) — role: ${user.role}, isViewOnly: ${user.isViewOnly}`)
  }

  // ─── Serial Keys ──────────────────────────────────────────────────
  const serialKeys = [
    {
      key: 'BF-TRIAL-2027-XXXX',
      plan: 'trial',
      maxDevices: 1,
    },
    {
      key: 'BF-STD-2027-XXXX',
      plan: 'standard',
      maxDevices: 3,
    },
    {
      key: 'BF-PRO-2027-XXXX',
      plan: 'professional',
      maxDevices: 10,
    },
    {
      key: 'BF-ENT-2027-XXXX',
      plan: 'enterprise',
      maxDevices: 999,
    },
  ]

  console.log('\n🔑 Creating serial keys...')
  for (const sk of serialKeys) {
    const serialKey = await prisma.serialKey.upsert({
      where: { key: sk.key },
      update: {
        plan: sk.plan,
        maxDevices: sk.maxDevices,
      },
      create: {
        key: sk.key,
        plan: sk.plan,
        maxDevices: sk.maxDevices,
      },
    })
    console.log(`   ✓ SerialKey: ${serialKey.key} — plan: ${serialKey.plan}, maxDevices: ${serialKey.maxDevices}`)
  }

  console.log('\n✅ Auth seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
