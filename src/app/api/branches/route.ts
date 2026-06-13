import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');

    const where: Record<string, unknown> = {};
    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const branches = await db.branch.findMany({
      where,
      include: {
        _count: { select: { employees: true, sales: true, warehouses: true } },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ data: branches });
  } catch (error) {
    console.error('Branches GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch branches' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, code, address, phone, email, manager } = body;

    if (!name || !code) {
      return NextResponse.json({ error: 'Name and code are required' }, { status: 400 });
    }

    const existing = await db.branch.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json({ error: 'Branch code already exists' }, { status: 409 });
    }

    const branch = await db.branch.create({
      data: { name, code, address, phone, email, manager },
      include: {
        _count: { select: { employees: true, sales: true, warehouses: true } },
      },
    });

    return NextResponse.json({ data: branch }, { status: 201 });
  } catch (error) {
    console.error('Branches POST error:', error);
    return NextResponse.json({ error: 'Failed to create branch' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, code, address, phone, email, manager, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'Branch ID is required' }, { status: 400 });
    }

    const existing = await db.branch.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 });
    }

    // If code is being changed, check uniqueness
    if (code && code !== existing.code) {
      const codeExists = await db.branch.findUnique({ where: { code } });
      if (codeExists) {
        return NextResponse.json({ error: 'Branch code already in use' }, { status: 409 });
      }
    }

    const branch = await db.branch.update({
      where: { id },
      data: { name, code, address, phone, email, manager, isActive },
      include: {
        _count: { select: { employees: true, sales: true, warehouses: true } },
      },
    });

    return NextResponse.json({ data: branch });
  } catch (error) {
    console.error('Branches PUT error:', error);
    return NextResponse.json({ error: 'Failed to update branch' }, { status: 500 });
  }
}
