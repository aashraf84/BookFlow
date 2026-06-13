import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId') || '';

    const where: Record<string, unknown> = { isActive: true };
    if (branchId) {
      where.branchId = branchId;
    }

    const warehouses = await db.warehouse.findMany({
      where,
      include: {
        branch: { select: { id: true, name: true, code: true } },
        inventory: {
          select: { quantity: true, costPrice: true, sellingPrice: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ data: warehouses });
  } catch (error) {
    console.error('Warehouses GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch warehouses' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, code, address, branchId } = body;

    if (!name || !code) {
      return NextResponse.json({ error: 'Name and code are required' }, { status: 400 });
    }

    const existing = await db.warehouse.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json({ error: 'Warehouse code already exists' }, { status: 409 });
    }

    const warehouse = await db.warehouse.create({
      data: { name, code, address, branchId },
      include: {
        branch: { select: { id: true, name: true } },
        inventory: { select: { quantity: true, costPrice: true, sellingPrice: true } },
      },
    });

    return NextResponse.json({ data: warehouse }, { status: 201 });
  } catch (error) {
    console.error('Warehouses POST error:', error);
    return NextResponse.json({ error: 'Failed to create warehouse' }, { status: 500 });
  }
}
