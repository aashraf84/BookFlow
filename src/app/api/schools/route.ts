import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { isActive: true };
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { contactPerson: { contains: search } },
        { email: { contains: search } },
        { address: { contains: search } },
      ];
    }

    const [schools, total] = await Promise.all([
      db.school.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true } },
          _count: { select: { contracts: true, packages: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.school.count({ where }),
    ]);

    return NextResponse.json({
      data: schools,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Schools GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch schools' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      // School fields
      name,
      address,
      phone,
      email,
      contactPerson,
      academicSession,
      customerId,
      // Contract fields (optional, create contract along with school)
      contractTitle,
      contractAcademicSession,
      contractTotalValue,
      contractStartDate,
      contractEndDate,
      contractNotes,
      // Package fields (optional, create package along with school)
      packageName,
      packageGrade,
      packageAcademicLevel,
      packageDescription,
      packageTotalPrice,
      packageDiscount,
      packageItems,
    } = body;

    if (!name) {
      return NextResponse.json({ error: 'School name is required' }, { status: 400 });
    }

    const school = await db.school.create({
      data: {
        name,
        address,
        phone,
        email,
        contactPerson,
        academicSession,
        customerId,
        contracts: contractTitle
          ? {
              create: {
                title: contractTitle,
                academicSession: contractAcademicSession,
                totalValue: contractTotalValue || 0,
                status: 'active',
                startDate: contractStartDate ? new Date(contractStartDate) : null,
                endDate: contractEndDate ? new Date(contractEndDate) : null,
                notes: contractNotes,
              },
            }
          : undefined,
        packages: packageName
          ? {
              create: {
                name: packageName,
                grade: packageGrade,
                academicLevel: packageAcademicLevel,
                description: packageDescription,
                totalPrice: packageTotalPrice || 0,
                discount: packageDiscount || 0,
                items:
                  packageItems && Array.isArray(packageItems)
                    ? {
                        create: packageItems.map(
                          (item: { bookId?: string; stationeryId?: string; quantity: number; unitPrice: number }) => ({
                            bookId: item.bookId || null,
                            stationeryId: item.stationeryId || null,
                            quantity: item.quantity || 1,
                            unitPrice: item.unitPrice || 0,
                          })
                        ),
                      }
                    : undefined,
              },
            }
          : undefined,
      },
      include: {
        customer: { select: { id: true, name: true } },
        contracts: true,
        packages: { include: { items: { include: { book: { select: { title: true } }, stationery: { select: { name: true } } } } } },
        _count: { select: { contracts: true, packages: true } },
      },
    });

    return NextResponse.json({ data: school }, { status: 201 });
  } catch (error) {
    console.error('Schools POST error:', error);
    return NextResponse.json({ error: 'Failed to create school' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, address, phone, email, contactPerson, academicSession, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'School ID is required' }, { status: 400 });
    }

    const existing = await db.school.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    const school = await db.school.update({
      where: { id },
      data: { name, address, phone, email, contactPerson, academicSession, isActive },
      include: {
        customer: { select: { id: true, name: true } },
        _count: { select: { contracts: true, packages: true } },
      },
    });

    return NextResponse.json({ data: school });
  } catch (error) {
    console.error('Schools PUT error:', error);
    return NextResponse.json({ error: 'Failed to update school' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'School ID is required' }, { status: 400 });
    }

    const existing = await db.school.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    // Soft delete by setting isActive to false
    await db.school.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ message: 'School deactivated successfully' });
  } catch (error) {
    console.error('Schools DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete school' }, { status: 500 });
  }
}
