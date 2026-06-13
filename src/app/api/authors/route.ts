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
        { nationality: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const [authors, total] = await Promise.all([
      db.author.findMany({
        where,
        include: { _count: { select: { books: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.author.count({ where }),
    ]);

    return NextResponse.json({
      data: authors,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Authors GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch authors' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, bio, nationality, website, email, phone } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const author = await db.author.create({
      data: { name, bio, nationality, website, email, phone },
      include: { _count: { select: { books: true } } },
    });

    return NextResponse.json({ data: author }, { status: 201 });
  } catch (error) {
    console.error('Authors POST error:', error);
    return NextResponse.json({ error: 'Failed to create author' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, bio, nationality, website, email, phone } = body;

    if (!id) {
      return NextResponse.json({ error: 'Author ID is required' }, { status: 400 });
    }

    const existing = await db.author.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Author not found' }, { status: 404 });
    }

    const author = await db.author.update({
      where: { id },
      data: { name, bio, nationality, website, email, phone },
      include: { _count: { select: { books: true } } },
    });

    return NextResponse.json({ data: author });
  } catch (error) {
    console.error('Authors PUT error:', error);
    return NextResponse.json({ error: 'Failed to update author' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Author ID is required' }, { status: 400 });
    }

    const existing = await db.author.findUnique({
      where: { id },
      include: { _count: { select: { books: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Author not found' }, { status: 404 });
    }

    if (existing._count.books > 0) {
      return NextResponse.json(
        { error: 'Cannot delete author with associated books' },
        { status: 409 }
      );
    }

    await db.author.delete({ where: { id } });
    return NextResponse.json({ message: 'Author deleted successfully' });
  } catch (error) {
    console.error('Authors DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete author' }, { status: 500 });
  }
}
