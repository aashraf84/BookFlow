import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const tiers = await db.loyaltyTier.findMany({
      orderBy: { minPoints: 'asc' },
    });
    return NextResponse.json({ data: tiers });
  } catch (error) {
    console.error('Loyalty Tiers GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch loyalty tiers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, minPoints, maxPoints, discount, benefits } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const tier = await db.loyaltyTier.create({
      data: {
        name,
        minPoints: minPoints || 0,
        maxPoints: maxPoints || null,
        discount: discount || 0,
        benefits,
      },
    });

    return NextResponse.json({ data: tier }, { status: 201 });
  } catch (error) {
    console.error('Loyalty Tiers POST error:', error);
    return NextResponse.json({ error: 'Failed to create loyalty tier' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, minPoints, maxPoints, discount, benefits } = body;

    if (!id) {
      return NextResponse.json({ error: 'Tier ID is required' }, { status: 400 });
    }

    const existing = await db.loyaltyTier.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Loyalty tier not found' }, { status: 404 });
    }

    const tier = await db.loyaltyTier.update({
      where: { id },
      data: { name, minPoints, maxPoints, discount, benefits },
    });

    return NextResponse.json({ data: tier });
  } catch (error) {
    console.error('Loyalty Tiers PUT error:', error);
    return NextResponse.json({ error: 'Failed to update loyalty tier' }, { status: 500 });
  }
}
