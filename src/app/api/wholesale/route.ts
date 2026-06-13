import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

function generateOrderNumber(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `WO-${year}${month}-${random}`;
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
      db.wholesaleOrder.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true, type: true } },
          items: {
            include: {
              book: { select: { id: true, title: true, price: true } },
              stationery: { select: { id: true, name: true, price: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.wholesaleOrder.count({ where }),
    ]);

    return NextResponse.json({
      data: orders,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Wholesale GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch wholesale orders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerId,
      dealerName,
      distributorName,
      discount,
      tax,
      paymentStatus,
      deliveryAddress,
      notes,
      items,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Order items are required' }, { status: 400 });
    }

    // Calculate totals
    let subtotal = 0;
    const orderItemsData = items.map((item: { bookId?: string; stationeryId?: string; quantity: number; unitPrice: number; discount?: number }) => {
      const itemDiscount = item.discount || 0;
      const itemTotal = item.quantity * item.unitPrice * (1 - itemDiscount / 100);
      subtotal += itemTotal;
      return {
        bookId: item.bookId || null,
        stationeryId: item.stationeryId || null,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: itemDiscount,
        totalPrice: itemTotal,
      };
    });

    const discountAmount = discount || 0;
    const taxRate = tax || 0;
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = afterDiscount * (taxRate / 100);
    const total = afterDiscount + taxAmount;

    // Generate unique order number
    let orderNumber = generateOrderNumber();
    let attempts = 0;
    while (attempts < 5) {
      const existing = await db.wholesaleOrder.findUnique({ where: { orderNumber } });
      if (!existing) break;
      orderNumber = generateOrderNumber();
      attempts++;
    }

    const order = await db.wholesaleOrder.create({
      data: {
        orderNumber,
        customerId,
        dealerName,
        distributorName,
        status: 'pending',
        subtotal,
        discount: discountAmount,
        tax: taxAmount,
        total,
        paymentStatus: paymentStatus || 'unpaid',
        deliveryAddress,
        notes,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        customer: { select: { id: true, name: true } },
        items: {
          include: {
            book: { select: { id: true, title: true } },
            stationery: { select: { id: true, name: true } },
          },
        },
      },
    });

    return NextResponse.json({ data: order }, { status: 201 });
  } catch (error) {
    console.error('Wholesale POST error:', error);
    return NextResponse.json({ error: 'Failed to create wholesale order' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, paymentStatus, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const existing = await db.wholesaleOrder.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Wholesale order not found' }, { status: 404 });
    }

    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    const validPaymentStatuses = ['unpaid', 'partial', 'paid'];
    if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
      return NextResponse.json({ error: 'Invalid payment status value' }, { status: 400 });
    }

    const order = await db.wholesaleOrder.update({
      where: { id },
      data: { status, paymentStatus, notes },
      include: {
        customer: { select: { id: true, name: true } },
        items: {
          include: {
            book: { select: { id: true, title: true } },
            stationery: { select: { id: true, name: true } },
          },
        },
      },
    });

    return NextResponse.json({ data: order });
  } catch (error) {
    console.error('Wholesale PUT error:', error);
    return NextResponse.json({ error: 'Failed to update wholesale order' }, { status: 500 });
  }
}
