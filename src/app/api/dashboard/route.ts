import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Previous period boundaries for trend calculations
    const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);

    // ── Core stats (existing) ───────────────────────────────────
    const todaySales = await db.sale.aggregate({
      _sum: { total: true },
      where: { createdAt: { gte: todayStart } },
    });

    const monthlyRevenue = await db.sale.aggregate({
      _sum: { total: true },
      where: { createdAt: { gte: monthStart } },
    });

    const activeCustomers = await db.customer.count({
      where: { isActive: true },
    });

    const inventoryItems = await db.inventoryItem.findMany({
      select: { quantity: true, costPrice: true },
    });
    const inventoryValue = inventoryItems.reduce(
      (sum, item) => sum + item.quantity * item.costPrice,
      0
    );

    const wholesaleOrdersCount = await db.wholesaleOrder.count();

    const onlineOrdersCount = await db.onlineOrder.count();

    const pendingPOsCount = await db.purchaseOrder.count({
      where: { status: 'pending' },
    });

    const recentSales = await db.sale.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { name: true } },
        branch: { select: { name: true } },
      },
    });

    const allInventoryItems = await db.inventoryItem.findMany({
      select: { quantity: true, reorderLevel: true },
    });
    const lowStockCount = allInventoryItems.filter(
      (item) => item.quantity <= item.reorderLevel
    ).length;

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

    // ── Trend calculations (period-over-period) ─────────────────
    const yesterdaySales = await db.sale.aggregate({
      _sum: { total: true },
      where: { createdAt: { gte: yesterdayStart, lt: todayStart } },
    });

    const lastMonthRevenue = await db.sale.aggregate({
      _sum: { total: true },
      where: { createdAt: { gte: lastMonthStart, lt: lastMonthEnd } },
    });

    // Customer trend: compare active customers count change
    const lastMonthCustomers = await db.customer.count({
      where: {
        isActive: true,
        createdAt: { lt: monthStart },
      },
    });

    // Inventory value trend: compare with last month's value
    const lastMonthInventoryItems = await db.inventoryItem.findMany({
      select: { quantity: true, costPrice: true, updatedAt: true },
    });
    // Approximate last month inventory value (use current as baseline)
    const lastMonthInventoryValue = lastMonthInventoryItems.reduce(
      (sum, item) => sum + item.quantity * item.costPrice,
      0
    );

    function calcTrend(current: number, previous: number): number {
      if (previous === 0) return current > 0 ? 100 : 0;
      return parseFloat((((current - previous) / previous) * 100).toFixed(1));
    }

    const trends = {
      todaySales: calcTrend(todaySales._sum.total || 0, yesterdaySales._sum.total || 0),
      monthlyRevenue: calcTrend(monthlyRevenue._sum.total || 0, lastMonthRevenue._sum.total || 0),
      activeCustomers: calcTrend(activeCustomers, lastMonthCustomers),
      inventoryValue: calcTrend(inventoryValue, lastMonthInventoryValue),
    };

    // ── Monthly revenue data (last 12 months) ───────────────────
    const monthlyRevenueData = [];
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEndDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const monthLabel = monthDate.toLocaleDateString('en-US', { month: 'short' });

      const monthAgg = await db.sale.aggregate({
        _sum: { total: true },
        where: {
          createdAt: {
            gte: monthDate,
            lt: monthEndDate,
          },
        },
      });

      monthlyRevenueData.push({
        month: monthLabel,
        revenue: monthAgg._sum.total || 0,
      });
    }

    // ── Sales by category data ──────────────────────────────────
    // Get sale items from the last 12 months with book/stationery info
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    // Books revenue by category
    const bookSaleItems = await db.saleItem.findMany({
      where: {
        sale: { createdAt: { gte: twelveMonthsAgo } },
        bookId: { not: null as unknown as string },
      },
      include: {
        book: {
          select: {
            categoryId: true,
            category: { select: { name: true } },
          },
        },
      },
    });

    // Stationery revenue by category
    const stationerySaleItems = await db.saleItem.findMany({
      where: {
        sale: { createdAt: { gte: twelveMonthsAgo } },
        stationeryId: { not: null as unknown as string },
      },
      include: {
        stationery: {
          select: {
            categoryId: true,
            category: { select: { name: true } },
          },
        },
      },
    });

    // Aggregate by category
    const categoryMap: Record<string, number> = {};
    for (const item of bookSaleItems) {
      const catName = item.book?.category?.name || 'Other Books';
      categoryMap[catName] = (categoryMap[catName] || 0) + item.totalPrice;
    }
    for (const item of stationerySaleItems) {
      const catName = item.stationery?.category?.name || 'Other Stationery';
      categoryMap[catName] = (categoryMap[catName] || 0) + item.totalPrice;
    }

    // If no category data exists, provide top-level breakdown
    let salesByCategoryData;
    if (Object.keys(categoryMap).length > 0) {
      const fillColors = [
        'var(--color-macos-blue)',
        'var(--color-macos-green)',
        'var(--color-macos-orange)',
        'var(--color-macos-purple)',
        'var(--color-macos-red)',
        'var(--color-macos-teal)',
      ];
      salesByCategoryData = Object.entries(categoryMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 6)
        .map(([category, sales], idx) => ({
          category,
          sales: Math.round(sales),
          fill: fillColors[idx % fillColors.length],
        }));
    } else {
      // Fallback: Books vs Stationery from sale items
      const totalBooksRevenue = bookSaleItems.reduce((sum, item) => sum + item.totalPrice, 0);
      const totalStationeryRevenue = stationerySaleItems.reduce((sum, item) => sum + item.totalPrice, 0);
      salesByCategoryData = [
        { category: 'Books', sales: Math.round(totalBooksRevenue), fill: 'var(--color-macos-blue)' },
        { category: 'Stationery', sales: Math.round(totalStationeryRevenue), fill: 'var(--color-macos-green)' },
        { category: 'School Supplies', sales: 0, fill: 'var(--color-macos-orange)' },
      ].filter((d) => d.sales > 0 || d.category === 'Books');
    }

    // ── Branch performance data ─────────────────────────────────
    const branches = await db.branch.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
    });

    const branchPerformanceData = await Promise.all(
      branches.map(async (branch) => {
        const branchAgg = await db.sale.aggregate({
          _sum: { total: true },
          where: {
            branchId: branch.id,
            createdAt: { gte: twelveMonthsAgo },
          },
        });

        const branchOrderCount = await db.sale.count({
          where: {
            branchId: branch.id,
            createdAt: { gte: twelveMonthsAgo },
          },
        });

        return {
          branch: branch.name,
          revenue: branchAgg._sum.total || 0,
          orders: branchOrderCount,
        };
      })
    );

    // Sort by revenue descending
    branchPerformanceData.sort((a, b) => b.revenue - a.revenue);

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
      // New chart data
      trends,
      monthlyRevenueData,
      salesByCategoryData,
      branchPerformanceData,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
