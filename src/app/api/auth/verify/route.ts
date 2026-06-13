import { NextRequest, NextResponse } from 'next/server'
import { db, ensureSeedData } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Ensure seed data exists on fresh deployments
    await ensureSeedData()

    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Authorization token is required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    const session = await db.session.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Invalid session token' },
        { status: 401 }
      )
    }

    if (new Date() > session.expiresAt) {
      // Clean up expired session
      await db.session.delete({ where: { id: session.id } })
      return NextResponse.json(
        { success: false, message: 'Session has expired' },
        { status: 401 }
      )
    }

    if (!session.user.isActive) {
      return NextResponse.json(
        { success: false, message: 'Account is deactivated' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
        isViewOnly: session.user.isViewOnly,
        tenantId: session.user.tenantId,
      },
    })
  } catch (error) {
    console.error('Verify error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
