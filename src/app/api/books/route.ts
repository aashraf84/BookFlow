import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const categoryId = searchParams.get('categoryId') || '';
    const author = searchParams.get('author') || '';
    const authorId = searchParams.get('authorId') || '';
    const publisher = searchParams.get('publisher') || '';
    const publisherId = searchParams.get('publisherId') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { isActive: true };

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { isbn: { contains: search } },
        { barcode: { contains: search } },
        { author: { name: { contains: search } } },
        { publisher: { name: { contains: search } } },
      ];
    }

    if (category) {
      where.category = { name: { contains: category } };
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (author) {
      where.author = { name: { contains: author } };
    }

    if (authorId) {
      where.authorId = authorId;
    }

    if (publisher) {
      where.publisher = { name: { contains: publisher } };
    }

    if (publisherId) {
      where.publisherId = publisherId;
    }

    const [books, total] = await Promise.all([
      db.book.findMany({
        where,
        include: {
          author: { select: { id: true, name: true } },
          publisher: { select: { id: true, name: true } },
          category: { select: { id: true, name: true, type: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.book.count({ where }),
    ]);

    return NextResponse.json({
      data: books,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Books GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      isbn,
      title,
      subtitle,
      authorId,
      publisherId,
      categoryId,
      edition,
      language,
      pages,
      publishYear,
      description,
      coverImage,
      price,
      costPrice,
      discount,
      academicLevel,
      subject,
      barcode,
    } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Check ISBN uniqueness if provided
    if (isbn) {
      const existing = await db.book.findUnique({ where: { isbn } });
      if (existing) {
        return NextResponse.json({ error: 'ISBN already exists' }, { status: 409 });
      }
    }

    const book = await db.book.create({
      data: {
        isbn,
        title,
        subtitle,
        authorId,
        publisherId,
        categoryId,
        edition,
        language: language || 'English',
        pages,
        publishYear,
        description,
        coverImage,
        price: price || 0,
        costPrice: costPrice || 0,
        discount: discount || 0,
        academicLevel,
        subject,
        barcode,
      },
      include: {
        author: { select: { id: true, name: true } },
        publisher: { select: { id: true, name: true } },
        category: { select: { id: true, name: true, type: true } },
      },
    });

    return NextResponse.json({ data: book }, { status: 201 });
  } catch (error) {
    console.error('Books POST error:', error);
    return NextResponse.json({ error: 'Failed to create book' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      isbn,
      title,
      subtitle,
      authorId,
      publisherId,
      categoryId,
      edition,
      language,
      pages,
      publishYear,
      description,
      coverImage,
      price,
      costPrice,
      discount,
      academicLevel,
      subject,
      barcode,
      isActive,
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Book ID is required' }, { status: 400 });
    }

    const existing = await db.book.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    // Check ISBN uniqueness if being changed
    if (isbn && isbn !== existing.isbn) {
      const isbnExists = await db.book.findUnique({ where: { isbn } });
      if (isbnExists) {
        return NextResponse.json({ error: 'ISBN already exists' }, { status: 409 });
      }
    }

    const book = await db.book.update({
      where: { id },
      data: {
        isbn,
        title,
        subtitle,
        authorId,
        publisherId,
        categoryId,
        edition,
        language,
        pages,
        publishYear,
        description,
        coverImage,
        price,
        costPrice,
        discount,
        academicLevel,
        subject,
        barcode,
        isActive,
      },
      include: {
        author: { select: { id: true, name: true } },
        publisher: { select: { id: true, name: true } },
        category: { select: { id: true, name: true, type: true } },
      },
    });

    return NextResponse.json({ data: book });
  } catch (error) {
    console.error('Books PUT error:', error);
    return NextResponse.json({ error: 'Failed to update book' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Book ID is required' }, { status: 400 });
    }

    const existing = await db.book.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    // Soft delete
    await db.book.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Books DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete book' }, { status: 500 });
  }
}
