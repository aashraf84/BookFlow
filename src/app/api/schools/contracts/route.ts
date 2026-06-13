import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('schoolId');
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (schoolId) where.schoolId = schoolId;
    if (status) where.status = status;

    const contracts = await db.schoolContract.findMany({
      where,
      include: {
        school: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: contracts });
  } catch (error) {
    console.error('Contracts GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch contracts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { schoolId, title, academicSession, totalValue, startDate, endDate, notes } = body;

    if (!schoolId || !title) {
      return NextResponse.json({ error: 'School and title are required' }, { status: 400 });
    }

    const school = await db.school.findUnique({ where: { id: schoolId } });
    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    const contract = await db.schoolContract.create({
      data: {
        schoolId,
        title,
        academicSession,
        totalValue: totalValue || 0,
        status: 'active',
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        notes,
      },
      include: {
        school: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ data: contract }, { status: 201 });
  } catch (error) {
    console.error('Contracts POST error:', error);
    return NextResponse.json({ error: 'Failed to create contract' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, academicSession, totalValue, status, startDate, endDate, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Contract ID is required' }, { status: 400 });
    }

    const existing = await db.schoolContract.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    const contract = await db.schoolContract.update({
      where: { id },
      data: {
        title,
        academicSession,
        totalValue,
        status,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        notes,
      },
      include: {
        school: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ data: contract });
  } catch (error) {
    console.error('Contracts PUT error:', error);
    return NextResponse.json({ error: 'Failed to update contract' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Contract ID is required' }, { status: 400 });
    }

    await db.schoolContract.delete({ where: { id } });
    return NextResponse.json({ message: 'Contract deleted successfully' });
  } catch (error) {
    console.error('Contracts DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete contract' }, { status: 500 });
  }
}
