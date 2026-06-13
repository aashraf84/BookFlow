import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

function generateOrderNumber(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ONL-${year}${month}-${random}`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      db.onlineOrder.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.onlineOrder.count({ where }),
    ]);

    // Parse items JSON for each order
    const ordersWithParsedItems = orders.map((order) => ({
      ...order,
      items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items,
    }));

    return NextResponse.json({
      data: ordersWithParsedItems,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Ecommerce GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch online orders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      items,
      total,
      deliveryMethod,
      deliveryAddress,
      notes,
    } = body;

    if (!customerName || !items) {
      return NextResponse.json(
        { error: 'Customer name and items are required' },
        { status: 400 }
      );
    }

    // Generate unique order number
    let orderNumber = generateOrderNumber();
    let attempts = 0;
    while (attempts < 5) {
      const existing = await db.onlineOrder.findUnique({ where: { orderNumber } });
      if (!existing) break;
      orderNumber = generateOrderNumber();
      attempts++;
    }

    const order = await db.onlineOrder.create({
      data: {
        orderNumber,
        customerName,
        customerEmail,
        customerPhone,
        items: typeof items === 'string' ? items : JSON.stringify(items),
        total: total || 0,
        status: 'pending',
        deliveryMethod: deliveryMethod || 'home',
        deliveryAddress,
        notes,
      },
    });

    return NextResponse.json({
      data: {
        ...order,
        items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Ecommerce POST error:', error);
    return NextResponse.json({ error: 'Failed to create online order' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, deliveryMethod, deliveryAddress, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const existing = await db.onlineOrder.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Online order not found' }, { status: 404 });
    }

    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    const order = await db.onlineOrder.update({
      where: { id },
      data: { status, deliveryMethod, deliveryAddress, notes },
    });

    return NextResponse.json({
      data: {
        ...order,
        items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items,
      },
    });
  } catch (error) {
    console.error('Ecommerce PUT error:', error);
    return NextResponse.json({ error: 'Failed to update online order' }, { status: 500 });
  }
}
