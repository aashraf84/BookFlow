import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || '';

    const where: Record<string, unknown> = {};
    if (type) {
      where.type = type;
    }

    const categories = await db.bookCategory.findMany({
      where,
      include: { _count: { select: { books: true } } },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ data: categories });
  } catch (error) {
    console.error('Categories GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const category = await db.bookCategory.create({
      data: { name, type },
      include: { _count: { select: { books: true } } },
    });

    return NextResponse.json({ data: category }, { status: 201 });
  } catch (error) {
    console.error('Categories POST error:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
