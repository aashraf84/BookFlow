import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { isActive: true };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    if (type) {
      where.type = type;
    }

    const [customers, total] = await Promise.all([
      db.customer.findMany({
        where,
        include: {
          _count: { select: { sales: true, wholesaleOrders: true } },
          school: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.customer.count({ where }),
    ]);

    return NextResponse.json({
      data: customers,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Customers GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, address, type, creditLimit } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const customer = await db.customer.create({
      data: {
        name,
        email,
        phone,
        address,
        type: type || 'retail',
        creditLimit: creditLimit || 0,
      },
      include: {
        _count: { select: { sales: true, wholesaleOrders: true } },
      },
    });

    return NextResponse.json({ data: customer }, { status: 201 });
  } catch (error) {
    console.error('Customers POST error:', error);
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, email, phone, address, type, creditLimit, isActive, loyaltyPoints } = body;

    if (!id) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
    }

    const existing = await db.customer.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const customer = await db.customer.update({
      where: { id },
      data: { name, email, phone, address, type, creditLimit, isActive, loyaltyPoints },
      include: {
        _count: { select: { sales: true, wholesaleOrders: true } },
      },
    });

    return NextResponse.json({ data: customer });
  } catch (error) {
    console.error('Customers PUT error:', error);
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
  }
}
