import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

function generateInvoiceNumber(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `INV-${year}${month}${day}-${random}`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || '';
    const branchId = searchParams.get('branchId') || '';
    const type = searchParams.get('type') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (date) {
      const dateStart = new Date(date);
      const dateEnd = new Date(dateStart);
      dateEnd.setDate(dateEnd.getDate() + 1);
      where.createdAt = { gte: dateStart, lt: dateEnd };
    }

    if (branchId) {
      where.branchId = branchId;
    }

    if (type) {
      where.saleType = type;
    }

    const [sales, total] = await Promise.all([
      db.sale.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true, type: true } },
          branch: { select: { id: true, name: true } },
          employee: { select: { id: true, name: true } },
          items: {
            include: {
              book: { select: { id: true, title: true } },
              stationery: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.sale.count({ where }),
    ]);

    return NextResponse.json({
      data: sales,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Sales GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch sales' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerId,
      branchId,
      employeeId,
      discount,
      tax,
      paymentMethod,
      paymentStatus,
      saleType,
      notes,
      items,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Sale items are required' }, { status: 400 });
    }

    // Calculate totals from items
    let subtotal = 0;
    const saleItemsData = items.map((item: { bookId?: string; stationeryId?: string; quantity: number; unitPrice: number; discount?: number }) => {
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

    // Generate unique invoice number
    let invoiceNumber = generateInvoiceNumber();
    let attempts = 0;
    while (attempts < 5) {
      const existing = await db.sale.findUnique({ where: { invoiceNumber } });
      if (!existing) break;
      invoiceNumber = generateInvoiceNumber();
      attempts++;
    }

    const sale = await db.sale.create({
      data: {
        invoiceNumber,
        customerId,
        branchId,
        employeeId,
        subtotal,
        discount: discountAmount,
        tax: taxAmount,
        total,
        paymentMethod: paymentMethod || 'cash',
        paymentStatus: paymentStatus || 'paid',
        saleType: saleType || 'retail',
        notes,
        items: {
          create: saleItemsData,
        },
      },
      include: {
        customer: { select: { id: true, name: true } },
        branch: { select: { id: true, name: true } },
        employee: { select: { id: true, name: true } },
        items: {
          include: {
            book: { select: { id: true, title: true } },
            stationery: { select: { id: true, name: true } },
          },
        },
      },
    });

    // Update inventory quantities for sold items
    for (const item of items) {
      if (item.bookId && branchId) {
        const inventoryItem = await db.inventoryItem.findFirst({
          where: { bookId: item.bookId, branchId },
        });
        if (inventoryItem) {
          await db.inventoryItem.update({
            where: { id: inventoryItem.id },
            data: { quantity: { decrement: item.quantity } },
          });
        }
      }
      if (item.stationeryId && branchId) {
        const inventoryItem = await db.inventoryItem.findFirst({
          where: { stationeryId: item.stationeryId, branchId },
        });
        if (inventoryItem) {
          await db.inventoryItem.update({
            where: { id: inventoryItem.id },
            data: { quantity: { decrement: item.quantity } },
          });
        }
      }
    }

    // Update customer total spent if customer is provided
    if (customerId) {
      await db.customer.update({
        where: { id: customerId },
        data: {
          totalSpent: { increment: total },
          loyaltyPoints: { increment: Math.floor(total) },
        },
      });
    }

    return NextResponse.json({ data: sale }, { status: 201 });
  } catch (error) {
    console.error('Sales POST error:', error);
    return NextResponse.json({ error: 'Failed to create sale' }, { status: 500 });
  }
}
