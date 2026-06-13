import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const department = searchParams.get('department') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { isActive: true };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { position: { contains: search } },
      ];
    }

    if (department) {
      where.department = department;
    }

    const [employees, total] = await Promise.all([
      db.employee.findMany({
        where,
        include: {
          branch: { select: { id: true, name: true, code: true } },
          _count: { select: { sales: true, attendance: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.employee.count({ where }),
    ]);

    return NextResponse.json({
      data: employees,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Employees GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, department, position, salary, hireDate, branchId } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const existing = await db.employee.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }

    const employee = await db.employee.create({
      data: {
        name,
        email,
        phone,
        department,
        position,
        salary: salary || 0,
        hireDate: hireDate ? new Date(hireDate) : null,
        branchId,
      },
      include: {
        branch: { select: { id: true, name: true, code: true } },
      },
    });

    return NextResponse.json({ data: employee }, { status: 201 });
  } catch (error) {
    console.error('Employees POST error:', error);
    return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, email, phone, department, position, salary, hireDate, branchId, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
    }

    const existing = await db.employee.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // If email is being changed, check uniqueness
    if (email && email !== existing.email) {
      const emailExists = await db.employee.findUnique({ where: { email } });
      if (emailExists) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
      }
    }

    const employee = await db.employee.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        department,
        position,
        salary,
        hireDate: hireDate ? new Date(hireDate) : undefined,
        branchId,
        isActive,
      },
      include: {
        branch: { select: { id: true, name: true, code: true } },
      },
    });

    return NextResponse.json({ data: employee });
  } catch (error) {
    console.error('Employees PUT error:', error);
    return NextResponse.json({ error: 'Failed to update employee' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
    }

    const existing = await db.employee.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Soft delete
    await db.employee.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ message: 'Employee deactivated successfully' });
  } catch (error) {
    console.error('Employees DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete employee' }, { status: 500 });
  }
}
