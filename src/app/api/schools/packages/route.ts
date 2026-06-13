import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('schoolId');

    const where: Record<string, unknown> = { isActive: true };
    if (schoolId) where.schoolId = schoolId;

    const packages = await db.academicPackage.findMany({
      where,
      include: {
        school: { select: { id: true, name: true } },
        items: {
          include: {
            book: { select: { id: true, title: true, price: true } },
            stationery: { select: { id: true, name: true, price: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: packages });
  } catch (error) {
    console.error('Packages GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch packages' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { schoolId, name, grade, academicLevel, description, totalPrice, discount, items } = body;

    if (!name) {
      return NextResponse.json({ error: 'Package name is required' }, { status: 400 });
    }

    const pkg = await db.academicPackage.create({
      data: {
        schoolId: schoolId || null,
        name,
        grade,
        academicLevel,
        description,
        totalPrice: totalPrice || 0,
        discount: discount || 0,
        items:
          items && Array.isArray(items) && items.length > 0
            ? {
                create: items.map(
                  (item: { bookId?: string | null; stationeryId?: string | null; quantity: number; unitPrice: number }) => ({
                    bookId: item.bookId || null,
                    stationeryId: item.stationeryId || null,
                    quantity: item.quantity || 1,
                    unitPrice: item.unitPrice || 0,
                  })
                ),
              }
            : undefined,
      },
      include: {
        school: { select: { id: true, name: true } },
        items: {
          include: {
            book: { select: { id: true, title: true, price: true } },
            stationery: { select: { id: true, name: true, price: true } },
          },
        },
      },
    });

    return NextResponse.json({ data: pkg }, { status: 201 });
  } catch (error) {
    console.error('Packages POST error:', error);
    return NextResponse.json({ error: 'Failed to create package' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, grade, academicLevel, description, totalPrice, discount, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'Package ID is required' }, { status: 400 });
    }

    const existing = await db.academicPackage.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    const pkg = await db.academicPackage.update({
      where: { id },
      data: { name, grade, academicLevel, description, totalPrice, discount, isActive },
      include: {
        school: { select: { id: true, name: true } },
        items: {
          include: {
            book: { select: { id: true, title: true, price: true } },
            stationery: { select: { id: true, name: true, price: true } },
          },
        },
      },
    });

    return NextResponse.json({ data: pkg });
  } catch (error) {
    console.error('Packages PUT error:', error);
    return NextResponse.json({ error: 'Failed to update package' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Package ID is required' }, { status: 400 });
    }

    // Soft delete
    await db.academicPackage.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ message: 'Package deactivated successfully' });
  } catch (error) {
    console.error('Packages DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete package' }, { status: 500 });
  }
}
