import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Today's sales total
    const todaySales = await db.sale.aggregate({
      _sum: { total: true },
      where: { createdAt: { gte: todayStart } },
    });

    // Monthly revenue
    const monthlyRevenue = await db.sale.aggregate({
      _sum: { total: true },
      where: { createdAt: { gte: monthStart } },
    });

    // Active customers
    const activeCustomers = await db.customer.count({
      where: { isActive: true },
    });

    // Inventory value (sum of quantity * costPrice)
    const inventoryItems = await db.inventoryItem.findMany({
      select: { quantity: true, costPrice: true },
    });
    const inventoryValue = inventoryItems.reduce(
      (sum, item) => sum + item.quantity * item.costPrice,
      0
    );

    // Wholesale orders count
    const wholesaleOrdersCount = await db.wholesaleOrder.count();

    // Online orders count
    const onlineOrdersCount = await db.onlineOrder.count();

    // Pending purchase orders count
    const pendingPOsCount = await db.purchaseOrder.count({
      where: { status: 'pending' },
    });

    // Recent sales (last 5)
    const recentSales = await db.sale.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { name: true } },
        branch: { select: { name: true } },
      },
    });

    // Low stock items count - filter in application code since SQLite doesn't support column comparison
    const allInventoryItems = await db.inventoryItem.findMany({
      select: { quantity: true, reorderLevel: true },
    });
    const lowStockCount = allInventoryItems.filter(
      (item) => item.quantity <= item.reorderLevel
    ).length;

    // Top selling books this month
    const topSellingBooks = await db.saleItem.groupBy({
      by: ['bookId'],
      where: {
        sale: { createdAt: { gte: monthStart } },
        bookId: { not: null as unknown as string },
      },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });

    // Get book details for top sellers
    const topBookIds = topSellingBooks.map((item) => item.bookId).filter(Boolean) as string[];
    const topBooks = await db.book.findMany({
      where: { id: { in: topBookIds } },
      select: { id: true, title: true, author: { select: { name: true } } },
    });

    const topSellingWithDetails = topSellingBooks.map((item) => {
      const book = topBooks.find((b) => b.id === item.bookId);
      return {
        bookId: item.bookId,
        title: book?.title || 'Unknown',
        author: book?.author?.name || 'Unknown',
        totalSold: item._sum.quantity || 0,
      };
    });

    return NextResponse.json({
      todaySales: todaySales._sum.total || 0,
      monthlyRevenue: monthlyRevenue._sum.total || 0,
      activeCustomers,
      inventoryValue,
      wholesaleOrdersCount,
      onlineOrdersCount,
      pendingPOsCount,
      lowStockCount,
      recentSales,
      topSellingBooks: topSellingWithDetails,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
