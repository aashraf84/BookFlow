import { NextResponse } from 'next/server'
import { db, ensureSeedData } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

export async function POST() {
  try {
    // Ensure seed data exists on fresh deployments
    await ensureSeedData()

    // Find or create demo user
    let user = await db.user.findFirst({
      where: { role: 'demo' },
    })

    if (!user) {
      user = await db.user.create({
        data: {
          name: 'Demo User',
          email: 'demo@bookflow.os',
          password: 'demo123',
          role: 'demo',
          isViewOnly: true,
        },
      })
    }

    const token = uuidv4()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now

    await db.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    })

    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isViewOnly: user.isViewOnly,
      },
    })
  } catch (error) {
    console.error('Demo login error:', error)
    return NextResponse.json(
      { success: false, error: 'Demo login failed. Please try again.' },
      { status: 200 }
    )
  }
}
