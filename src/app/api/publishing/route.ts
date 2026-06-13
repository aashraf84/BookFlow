import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET: Fetch manuscripts or print orders based on ?type=
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'manuscripts';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    switch (type) {
      case 'manuscripts': {
        const where: Record<string, unknown> = {};
        if (status) where.status = status;

        const [manuscripts, total] = await Promise.all([
          db.manuscript.findMany({
            where,
            orderBy: { submittedAt: 'desc' },
            skip,
            take: limit,
          }),
          db.manuscript.count({ where }),
        ]);
        return NextResponse.json({
          data: manuscripts,
          pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
      }

      case 'print-orders': {
        const where: Record<string, unknown> = {};
        if (status) where.status = status;

        const [printOrders, total] = await Promise.all([
          db.printOrder.findMany({
            where,
            include: {
              book: { select: { id: true, title: true, isbn: true } },
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
          }),
          db.printOrder.count({ where }),
        ]);
        return NextResponse.json({
          data: printOrders,
          pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid type. Use manuscripts or print-orders' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Publishing GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch publishing data' }, { status: 500 });
  }
}

// POST: Create manuscripts or print orders based on ?type=
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'manuscripts';
    const body = await request.json();

    switch (type) {
      case 'manuscripts': {
        const { title, author, notes } = body;
        if (!title) {
          return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }

        const manuscript = await db.manuscript.create({
          data: {
            title,
            author,
            status: 'submitted',
            submittedAt: new Date(),
            notes,
          },
        });
        return NextResponse.json({ data: manuscript }, { status: 201 });
      }

      case 'print-orders': {
        const { bookId, quantity, costPerUnit, notes } = body;
        if (!bookId || !quantity) {
          return NextResponse.json(
            { error: 'Book ID and quantity are required' },
            { status: 400 }
          );
        }

        const printOrder = await db.printOrder.create({
          data: {
            bookId,
            quantity,
            status: 'ordered',
            costPerUnit: costPerUnit || 0,
            totalCost: quantity * (costPerUnit || 0),
            notes,
          },
          include: {
            book: { select: { id: true, title: true, isbn: true } },
          },
        });
        return NextResponse.json({ data: printOrder }, { status: 201 });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid type. Use manuscripts or print-orders' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Publishing POST error:', error);
    return NextResponse.json({ error: 'Failed to create publishing record' }, { status: 500 });
  }
}

// PUT: Update manuscript or print order status
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'manuscripts';
    const body = await request.json();

    switch (type) {
      case 'manuscripts': {
        const { id, status, notes, title, author } = body;
        if (!id) {
          return NextResponse.json({ error: 'Manuscript ID is required' }, { status: 400 });
        }

        const existing = await db.manuscript.findUnique({ where: { id } });
        if (!existing) {
          return NextResponse.json({ error: 'Manuscript not found' }, { status: 404 });
        }

        const validStatuses = ['submitted', 'reviewed', 'approved', 'published', 'rejected'];
        if (status && !validStatuses.includes(status)) {
          return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const updateData: Record<string, unknown> = { status, notes, title, author };
        if (status === 'reviewed') updateData.reviewedAt = new Date();
        if (status === 'published') updateData.publishedAt = new Date();

        const manuscript = await db.manuscript.update({
          where: { id },
          data: updateData,
        });
        return NextResponse.json({ data: manuscript });
      }

      case 'print-orders': {
        const { id, status, quantity, costPerUnit, notes } = body;
        if (!id) {
          return NextResponse.json({ error: 'Print order ID is required' }, { status: 400 });
        }

        const existing = await db.printOrder.findUnique({ where: { id } });
        if (!existing) {
          return NextResponse.json({ error: 'Print order not found' }, { status: 404 });
        }

        const validStatuses = ['ordered', 'printing', 'completed'];
        if (status && !validStatuses.includes(status)) {
          return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const printOrder = await db.printOrder.update({
          where: { id },
          data: {
            status,
            quantity,
            costPerUnit,
            totalCost: quantity && costPerUnit ? quantity * costPerUnit : undefined,
            notes,
          },
          include: {
            book: { select: { id: true, title: true, isbn: true } },
          },
        });
        return NextResponse.json({ data: printOrder });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid type. Use manuscripts or print-orders' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Publishing PUT error:', error);
    return NextResponse.json({ error: 'Failed to update publishing record' }, { status: 500 });
  }
}
