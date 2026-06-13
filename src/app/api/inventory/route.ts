import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId') || '';
    const warehouseId = searchParams.get('warehouseId') || '';
    const lowStock = searchParams.get('lowStock') === 'true';
    const getTransfers = searchParams.get('transfers') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Return transfers if requested
    if (getTransfers) {
      const transfers = await db.stockTransfer.findMany({
        include: {
          fromBranch: { select: { id: true, name: true, code: true } },
          toBranch: { select: { id: true, name: true, code: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      });
      const total = await db.stockTransfer.count();
      return NextResponse.json({
        transfers,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    }

    const where: Record<string, unknown> = {};

    if (branchId) {
      where.branchId = branchId;
    }

    if (warehouseId) {
      where.warehouseId = warehouseId;
    }

    // For low stock, we fetch all matching items and filter in application code
    // since SQLite doesn't support column-to-column comparison in WHERE
    if (lowStock) {
      // Fetch more items to account for filtering
      const allItems = await db.inventoryItem.findMany({
        where,
        include: {
          book: {
            select: { id: true, title: true, isbn: true, price: true, author: { select: { name: true } } },
          },
          stationery: {
            select: { id: true, name: true, sku: true, price: true, brand: true },
          },
          warehouse: { select: { id: true, name: true, code: true } },
          branch: { select: { id: true, name: true, code: true } },
        },
        orderBy: { updatedAt: 'desc' },
      });

      const filteredItems = allItems.filter((item) => item.quantity <= item.reorderLevel);
      const total = filteredItems.length;
      const paginatedItems = filteredItems.slice(skip, skip + limit);

      const itemsWithFlag = paginatedItems.map((item) => ({
        ...item,
        isLowStock: true,
      }));

      return NextResponse.json({
        data: itemsWithFlag,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    }

    const [items, total] = await Promise.all([
      db.inventoryItem.findMany({
        where,
        include: {
          book: {
            select: { id: true, title: true, isbn: true, price: true, author: { select: { name: true } } },
          },
          stationery: {
            select: { id: true, name: true, sku: true, price: true, brand: true },
          },
          warehouse: { select: { id: true, name: true, code: true } },
          branch: { select: { id: true, name: true, code: true } },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      db.inventoryItem.count({ where }),
    ]);

    // Add computed isLowStock flag
    const itemsWithFlag = items.map((item) => ({
      ...item,
      isLowStock: item.quantity <= item.reorderLevel,
    }));

    return NextResponse.json({
      data: itemsWithFlag,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Inventory GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Handle stock transfer creation
    if (body.type === 'transfer') {
      const { fromBranchId, toBranchId, notes } = body;

      if (!fromBranchId || !toBranchId) {
        return NextResponse.json(
          { error: 'From and to branch IDs are required' },
          { status: 400 }
        );
      }

      if (fromBranchId === toBranchId) {
        return NextResponse.json(
          { error: 'Source and destination branches must be different' },
          { status: 400 }
        );
      }

      const transfer = await db.stockTransfer.create({
        data: {
          fromBranchId,
          toBranchId,
          items: '[]',
          status: 'pending',
          notes,
        },
        include: {
          fromBranch: { select: { id: true, name: true, code: true } },
          toBranch: { select: { id: true, name: true, code: true } },
        },
      });

      return NextResponse.json({ data: transfer }, { status: 201 });
    }

    // Handle inventory item creation/update
    const {
      warehouseId,
      branchId,
      bookId,
      stationeryId,
      quantity,
      reorderLevel,
      maxStockLevel,
      batchNumber,
      costPrice,
      sellingPrice,
      location,
    } = body;

    // Validate: either bookId or stationeryId must be provided
    if (!bookId && !stationeryId) {
      return NextResponse.json(
        { error: 'Either bookId or stationeryId is required' },
        { status: 400 }
      );
    }

    // Check if an inventory item already exists for this product at this location
    const existingFilter: Record<string, unknown> = {};
    if (warehouseId) existingFilter.warehouseId = warehouseId;
    if (branchId) existingFilter.branchId = branchId;
    if (bookId) existingFilter.bookId = bookId;
    if (stationeryId) existingFilter.stationeryId = stationeryId;

    const existing = await db.inventoryItem.findFirst({ where: existingFilter });

    if (existing) {
      // Update existing item by adding to quantity
      const updated = await db.inventoryItem.update({
        where: { id: existing.id },
        data: {
          quantity: existing.quantity + (quantity || 0),
          costPrice: costPrice ?? existing.costPrice,
          sellingPrice: sellingPrice ?? existing.sellingPrice,
          batchNumber: batchNumber ?? existing.batchNumber,
          location: location ?? existing.location,
          reorderLevel: reorderLevel ?? existing.reorderLevel,
          maxStockLevel: maxStockLevel ?? existing.maxStockLevel,
        },
        include: {
          book: { select: { id: true, title: true, isbn: true } },
          stationery: { select: { id: true, name: true, sku: true } },
          warehouse: { select: { id: true, name: true } },
          branch: { select: { id: true, name: true } },
        },
      });
      return NextResponse.json({ data: updated });
    }

    // Create new inventory item
    const item = await db.inventoryItem.create({
      data: {
        warehouseId,
        branchId,
        bookId,
        stationeryId,
        quantity: quantity || 0,
        reorderLevel: reorderLevel || 10,
        maxStockLevel: maxStockLevel || 500,
        batchNumber,
        costPrice: costPrice || 0,
        sellingPrice: sellingPrice || 0,
        location,
      },
      include: {
        book: { select: { id: true, title: true, isbn: true } },
        stationery: { select: { id: true, name: true, sku: true } },
        warehouse: { select: { id: true, name: true } },
        branch: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ data: item }, { status: 201 });
  } catch (error) {
    console.error('Inventory POST error:', error);
    return NextResponse.json({ error: 'Failed to create/update inventory item' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, quantity, operation, reorderLevel, maxStockLevel, costPrice, sellingPrice, location } = body;

    if (!id) {
      return NextResponse.json({ error: 'Inventory item ID is required' }, { status: 400 });
    }

    const existing = await db.inventoryItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 });
    }

    let newQuantity = existing.quantity;
    if (quantity !== undefined) {
      if (operation === 'add') {
        newQuantity = existing.quantity + quantity;
      } else if (operation === 'subtract') {
        newQuantity = Math.max(0, existing.quantity - quantity);
      } else {
        newQuantity = quantity;
      }
    }

    const item = await db.inventoryItem.update({
      where: { id },
      data: {
        quantity: newQuantity,
        reorderLevel,
        maxStockLevel,
        costPrice,
        sellingPrice,
        location,
      },
      include: {
        book: { select: { id: true, title: true, isbn: true } },
        stationery: { select: { id: true, name: true, sku: true } },
        warehouse: { select: { id: true, name: true } },
        branch: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ data: item });
  } catch (error) {
    console.error('Inventory PUT error:', error);
    return NextResponse.json({ error: 'Failed to update inventory item' }, { status: 500 });
  }
}
