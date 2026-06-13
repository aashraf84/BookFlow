import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    // Check if any owner already exists
    const existingOwner = await db.user.findFirst({
      where: { role: 'owner' },
    })

    if (existingOwner) {
      return NextResponse.json(
        { success: false, message: 'Owner account already exists. Only one owner is allowed.' },
        { status: 403 }
      )
    }

    const ownerEmail = email || 'admin@apexflow.cloud'
    const ownerName = name || 'ApexFlow Admin'
    const ownerPassword = password || 'Admin@180H'

    // Create owner user
    const owner = await db.user.create({
      data: {
        name: ownerName,
        email: ownerEmail,
        password: ownerPassword,
        role: 'owner',
        isActive: true,
        isViewOnly: false,
      },
    })

    // Create a universal serial key for owner
    const serialKey = await db.serialKey.create({
      data: {
        key: 'BFOWN-2025-PROF-UNLM',
        plan: 'enterprise',
        maxDevices: 999,
        isActive: true,
        activatedAt: new Date(),
        expiresAt: new Date('2030-12-31'),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Owner account created successfully',
      user: {
        id: owner.id,
        name: owner.name,
        email: owner.email,
        role: owner.role,
      },
      serialKey: serialKey.key,
      credentials: {
        email: ownerEmail,
        password: ownerPassword,
      },
    })
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
