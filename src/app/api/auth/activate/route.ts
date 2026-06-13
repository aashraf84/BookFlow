import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { key, deviceFingerprint } = body

    if (!key || typeof key !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Serial key is required' },
        { status: 400 }
      )
    }

    const serialKey = await db.serialKey.findUnique({
      where: { key },
    })

    if (!serialKey) {
      return NextResponse.json(
        { success: false, error: 'Invalid serial key' },
        { status: 200 }
      )
    }

    if (!serialKey.isActive) {
      return NextResponse.json(
        { success: false, error: 'This serial key has been deactivated' },
        { status: 200 }
      )
    }

    if (serialKey.expiresAt && new Date() > serialKey.expiresAt) {
      return NextResponse.json(
        { success: false, error: 'This serial key has expired' },
        { status: 200 }
      )
    }

    // Activate the key if not already activated
    const updatedKey = await db.serialKey.update({
      where: { id: serialKey.id },
      data: {
        activatedAt: serialKey.activatedAt ?? new Date(),
        deviceFingerprint: deviceFingerprint ?? serialKey.deviceFingerprint,
      },
    })

    return NextResponse.json({
      success: true,
      plan: updatedKey.plan,
      message: updatedKey.activatedAt === updatedKey.updatedAt
        ? 'Serial key activated successfully'
        : 'Serial key validated successfully',
    })
  } catch (error) {
    console.error('Activation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to activate. Please try again.' },
      { status: 200 }
    )
  }
}
