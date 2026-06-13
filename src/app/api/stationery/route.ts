import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const categories = searchParams.get('categories') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Return categories if requested
    if (categories) {
      const cats = await db.stationeryCategory.findMany({
        orderBy: { name: 'asc' },
      });
      return NextResponse.json({ categories: cats });
    }

    const where: Record<string, unknown> = { isActive: true };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
        { brand: { contains: search } },
        { barcode: { contains: search } },
      ];
    }

    if (category) {
      where.category = { name: { contains: category } };
    }

    const [products, total] = await Promise.all([
      db.stationeryProduct.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, type: true } },
          inventory: { select: { quantity: true, reorderLevel: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.stationeryProduct.count({ where }),
    ]);

    return NextResponse.json({
      data: products,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Stationery GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch stationery products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      sku,
      categoryId,
      brand,
      description,
      price,
      costPrice,
      discount,
      barcode,
      unit,
      minOrderQty,
    } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (sku) {
      const existing = await db.stationeryProduct.findUnique({ where: { sku } });
      if (existing) {
        return NextResponse.json({ error: 'SKU already exists' }, { status: 409 });
      }
    }

    const product = await db.stationeryProduct.create({
      data: {
        name,
        sku,
        categoryId,
        brand,
        description,
        price: price || 0,
        costPrice: costPrice || 0,
        discount: discount || 0,
        barcode,
        unit: unit || 'piece',
        minOrderQty: minOrderQty || 1,
      },
      include: {
        category: { select: { id: true, name: true, type: true } },
      },
    });

    return NextResponse.json({ data: product }, { status: 201 });
  } catch (error) {
    console.error('Stationery POST error:', error);
    return NextResponse.json({ error: 'Failed to create stationery product' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      name,
      sku,
      categoryId,
      brand,
      description,
      price,
      costPrice,
      discount,
      barcode,
      unit,
      minOrderQty,
      isActive,
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const existing = await db.stationeryProduct.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const product = await db.stationeryProduct.update({
      where: { id },
      data: {
        name,
        sku,
        categoryId,
        brand,
        description,
        price,
        costPrice,
        discount,
        barcode,
        unit,
        minOrderQty,
        isActive,
      },
      include: {
        category: { select: { id: true, name: true, type: true } },
      },
    });

    return NextResponse.json({ data: product });
  } catch (error) {
    console.error('Stationery PUT error:', error);
    return NextResponse.json({ error: 'Failed to update stationery product' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const existing = await db.stationeryProduct.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    await db.stationeryProduct.delete({ where: { id } });
    return NextResponse.json({ message: 'Stationery product deleted successfully' });
  } catch (error) {
    console.error('Stationery DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete stationery product' }, { status: 500 });
  }
}
