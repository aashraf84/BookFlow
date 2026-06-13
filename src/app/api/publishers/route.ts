import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { contact: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const [publishers, total] = await Promise.all([
      db.publisher.findMany({
        where,
        include: { _count: { select: { books: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.publisher.count({ where }),
    ]);

    return NextResponse.json({
      data: publishers,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Publishers GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch publishers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, contact, email, phone, address, website, agreement } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const publisher = await db.publisher.create({
      data: { name, contact, email, phone, address, website, agreement },
      include: { _count: { select: { books: true } } },
    });

    return NextResponse.json({ data: publisher }, { status: 201 });
  } catch (error) {
    console.error('Publishers POST error:', error);
    return NextResponse.json({ error: 'Failed to create publisher' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, contact, email, phone, address, website, agreement } = body;

    if (!id) {
      return NextResponse.json({ error: 'Publisher ID is required' }, { status: 400 });
    }

    const existing = await db.publisher.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Publisher not found' }, { status: 404 });
    }

    const publisher = await db.publisher.update({
      where: { id },
      data: { name, contact, email, phone, address, website, agreement },
      include: { _count: { select: { books: true } } },
    });

    return NextResponse.json({ data: publisher });
  } catch (error) {
    console.error('Publishers PUT error:', error);
    return NextResponse.json({ error: 'Failed to update publisher' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Publisher ID is required' }, { status: 400 });
    }

    const existing = await db.publisher.findUnique({
      where: { id },
      include: { _count: { select: { books: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Publisher not found' }, { status: 404 });
    }

    if (existing._count.books > 0) {
      return NextResponse.json(
        { error: 'Cannot delete publisher with associated books' },
        { status: 409 }
      );
    }

    await db.publisher.delete({ where: { id } });
    return NextResponse.json({ message: 'Publisher deleted successfully' });
  } catch (error) {
    console.error('Publishers DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete publisher' }, { status: 500 });
  }
}
