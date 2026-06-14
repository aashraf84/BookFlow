import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId') || ''
    const range = searchParams.get('range') || '12m'

    // Calculate date range filter
    const now = new Date()
    let startDate: Date
    switch (range) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case 'ytd':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      case '12m':
      default:
        startDate = new Date(now.getFullYear() - 1, now.getMonth() + 1, 1)
        break
    }

    const tenantFilter = tenantId ? { tenantId } : {}

    // ─── 1. Monthly Revenue ───
    const sales = await db.sale.findMany({
      where: {
        ...tenantFilter,
        createdAt: { gte: startDate },
      },
      select: {
        total: true,
        subtotal: true,
        discount: true,
        createdAt: true,
        paymentMethod: true,
      },
      orderBy: { createdAt: 'asc' },
    })

    // Group sales by month
    const monthlyMap = new Map<string, { revenue: number; orders: number; profit: number }>()
    for (const sale of sales) {
      const monthKey = sale.createdAt.toLocaleString('en', { month: 'short' })
      const existing = monthlyMap.get(monthKey) || { revenue: 0, orders: 0, profit: 0 }
      existing.revenue += sale.total
      existing.orders += 1
      existing.profit += sale.total * 0.3 // Estimate profit as 30% margin
      monthlyMap.set(monthKey, existing)
    }

    const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const monthlyRevenue = monthOrder
      .filter((m) => monthlyMap.has(m))
      .map((month) => {
        const data = monthlyMap.get(month)!
        return {
          month,
          revenue: Math.round(data.revenue),
          orders: data.orders,
          profit: Math.round(data.profit),
        }
      })

    // ─── 2. Top Selling Products ───
    const saleItems = await db.saleItem.findMany({
      where: {
        sale: {
          ...tenantFilter,
          createdAt: { gte: startDate },
        },
      },
      select: {
        bookId: true,
        stationeryId: true,
        quantity: true,
        totalPrice: true,
        book: { select: { title: true, category: { select: { name: true } } } },
        stationery: { select: { name: true, category: { select: { name: true } } } },
      },
    })

    // Aggregate by product
    const productMap = new Map<string, { name: string; category: string; sold: number; revenue: number }>()
    for (const item of saleItems) {
      const key = item.bookId || item.stationeryId || ''
      if (!key) continue
      const name = item.book?.title || item.stationery?.name || 'Unknown'
      const category = item.book?.category?.name || item.stationery?.category?.name || 'General'
      const existing = productMap.get(key) || { name, category, sold: 0, revenue: 0 }
      existing.sold += item.quantity
      existing.revenue += item.totalPrice
      productMap.set(key, existing)
    }

    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
      .map((p) => ({ ...p, revenue: Math.round(p.revenue) }))

    // ─── 3. Sales by Payment Method ───
    const paymentMap = new Map<string, { count: number; amount: number }>()
    for (const sale of sales) {
      const method = sale.paymentMethod || 'cash'
      const label = method === 'cash' ? 'Cash'
        : method === 'card' ? 'Card'
        : method === 'bank' ? 'Bank Transfer'
        : 'Wallet'
      const existing = paymentMap.get(label) || { count: 0, amount: 0 }
      existing.count += 1
      existing.amount += sale.total
      paymentMap.set(label, existing)
    }

    const totalPaymentAmount = Array.from(paymentMap.values()).reduce((sum, p) => sum + p.amount, 0) || 1
    const salesByPayment = Array.from(paymentMap.entries()).map(([method, data]) => ({
      method,
      value: Math.round((data.amount / totalPaymentAmount) * 100),
      amount: Math.round(data.amount),
    }))

    // ─── 4. Stock Level Summary ───
    const inventoryItems = await db.inventoryItem.findMany({
      where: tenantFilter,
      select: {
        quantity: true,
        reorderLevel: true,
        bookId: true,
        stationeryId: true,
        book: { select: { category: { select: { name: true } } } },
        stationery: { select: { category: { select: { name: true } } } },
      },
    })

    const categoryStockMap = new Map<string, { inStock: number; low: number; out: number }>()
    for (const item of inventoryItems) {
      const catName = item.book?.category?.name || item.stationery?.category?.name || 'General'
      const existing = categoryStockMap.get(catName) || { inStock: 0, low: 0, out: 0 }
      if (item.quantity <= 0) {
        existing.out += 1
      } else if (item.quantity <= item.reorderLevel) {
        existing.low += 1
      } else {
        existing.inStock += 1
      }
      categoryStockMap.set(catName, existing)
    }

    const stockLevels = Array.from(categoryStockMap.entries()).map(([name, data]) => ({
      name,
      ...data,
    }))

    // ─── 5. Inventory Movement Analysis ───
    // Aggregate sold quantities by product
    const soldQuantities = new Map<string, number>()
    for (const item of saleItems) {
      const key = item.bookId || item.stationeryId || ''
      if (!key) continue
      soldQuantities.set(key, (soldQuantities.get(key) || 0) + item.quantity)
    }

    // Get inventory with current stock
    const movingInventoryItems = await db.inventoryItem.findMany({
      where: tenantFilter,
      select: {
        bookId: true,
        stationeryId: true,
        quantity: true,
        book: { select: { title: true } },
        stationery: { select: { name: true } },
      },
    })

    const movingItems = movingInventoryItems
      .map((item) => {
        const key = item.bookId || item.stationeryId || ''
        const name = item.book?.title || item.stationery?.name || 'Unknown'
        const sold = soldQuantities.get(key) || 0
        let type: 'Fast' | 'Slow' | 'Dead' = 'Slow'
        if (sold === 0) type = 'Dead'
        else if (sold >= 50) type = 'Fast'
        return { name, type, sold, stock: item.quantity }
      })
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 15)

    // ─── 6. Publisher Performance ───
    const publishers = await db.publisher.findMany({
      where: tenantFilter,
      select: {
        id: true,
        name: true,
        books: {
          select: {
            id: true,
            saleItems: {
              where: {
                sale: {
                  ...tenantFilter,
                  createdAt: { gte: startDate },
                },
              },
              select: { quantity: true, totalPrice: true },
            },
          },
        },
      },
    })

    const publisherData = publishers
      .map((pub) => {
        const titles = pub.books.length
        let revenue = 0
        let orders = 0
        for (const book of pub.books) {
          for (const si of book.saleItems) {
            revenue += si.totalPrice
            orders += si.quantity
          }
        }
        return { name: pub.name, titles, revenue: Math.round(revenue), orders }
      })
      .filter((p) => p.revenue > 0 || p.titles > 0)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    // ─── 7. Author Performance ───
    const authors = await db.author.findMany({
      where: tenantFilter,
      select: {
        id: true,
        name: true,
        books: {
          select: {
            id: true,
            price: true,
            saleItems: {
              where: {
                sale: {
                  ...tenantFilter,
                  createdAt: { gte: startDate },
                },
              },
              select: { quantity: true },
            },
          },
        },
      },
    })

    const authorData = authors
      .map((author) => {
        const books = author.books.length
        let sold = 0
        let royalties = 0
        for (const book of author.books) {
          for (const si of book.saleItems) {
            sold += si.quantity
            royalties += si.quantity * book.price * 0.1 // 10% royalty estimate
          }
        }
        return { name: author.name, books, sold, royalties: Math.round(royalties) }
      })
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 10)

    // ─── 8. Wholesale Data ───
    const wholesaleOrders = await db.wholesaleOrder.findMany({
      where: {
        ...tenantFilter,
        createdAt: { gte: startDate },
      },
      select: {
        dealerName: true,
        distributorName: true,
        total: true,
        status: true,
      },
    })

    const wholesaleMap = new Map<string, { orders: number; total: number; status: string }>()
    for (const order of wholesaleOrders) {
      const name = order.dealerName || order.distributorName || 'Unknown'
      const existing = wholesaleMap.get(name) || { orders: 0, total: 0, status: 'Active' }
      existing.orders += 1
      existing.total += order.total
      if (order.status === 'pending') existing.status = 'Pending'
      wholesaleMap.set(name, existing)
    }

    const wholesaleData = Array.from(wholesaleMap.entries())
      .map(([name, data]) => ({
        name,
        orders: data.orders,
        total: Math.round(data.total),
        status: data.status,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)

    // ─── 9. School Contract Data ───
    const schoolContracts = await db.schoolContract.findMany({
      where: tenantFilter,
      select: {
        totalValue: true,
        status: true,
        school: { select: { name: true } },
      },
    })

    const schoolMap = new Map<string, { value: number; items: number; status: string }>()
    for (const contract of schoolContracts) {
      const name = contract.school.name
      const existing = schoolMap.get(name) || { value: 0, items: 0, status: 'Active' }
      existing.value += contract.totalValue
      existing.items += 1
      if (contract.status === 'expired') existing.status = 'Expiring'
      if (contract.status === 'cancelled') existing.status = 'Cancelled'
      schoolMap.set(name, existing)
    }

    const schoolContractData = Array.from(schoolMap.entries())
      .map(([name, data]) => ({
        name,
        value: Math.round(data.value),
        items: data.items,
        status: data.status,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)

    // ─── 10. Financial Summary ───
    // Get income by month from sales
    const incomeByMonth = new Map<string, number>()
    for (const sale of sales) {
      const monthKey = sale.createdAt.toLocaleString('en', { month: 'short' })
      incomeByMonth.set(monthKey, (incomeByMonth.get(monthKey) || 0) + sale.total)
    }

    // Get expenses by month
    const expenses = await db.expense.findMany({
      where: {
        ...tenantFilter,
        date: { gte: startDate },
      },
      select: { amount: true, date: true },
    })

    const expenseByMonth = new Map<string, number>()
    for (const expense of expenses) {
      const monthKey = expense.date.toLocaleString('en', { month: 'short' })
      expenseByMonth.set(monthKey, (expenseByMonth.get(monthKey) || 0) + expense.amount)
    }

    const allMonths = new Set([...incomeByMonth.keys(), ...expenseByMonth.keys()])
    const financialSummary = monthOrder
      .filter((m) => allMonths.has(m))
      .map((month) => {
        const income = Math.round(incomeByMonth.get(month) || 0)
        const expense = Math.round(expenseByMonth.get(month) || 0)
        return { month, income, expense, net: income - expense }
      })

    // ─── Summary Stats ───
    const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0)
    const totalOrders = sales.length
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
    const totalProfit = totalRevenue * 0.3
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0

    const totalSKUs = inventoryItems.length
    const lowStockCount = inventoryItems.filter((i) => i.quantity > 0 && i.quantity <= i.reorderLevel).length
    const outOfStockCount = inventoryItems.filter((i) => i.quantity <= 0).length
    const deadStockCount = movingItems.filter((i) => i.type === 'Dead').length

    const totalPublishers = publishers.length
    const totalTitles = publishers.reduce((sum, p) => sum + p.books.length, 0)
    const publisherRevenue = publisherData.reduce((sum, p) => sum + p.revenue, 0)
    const avgOrdersPerPublisher = totalPublishers > 0
      ? Math.round(publisherData.reduce((sum, p) => sum + p.orders, 0) / totalPublishers)
      : 0

    const totalAuthors = authors.length
    const totalBooksPublished = authors.reduce((sum, a) => sum + a.books, 0)
    const totalRoyalties = authorData.reduce((sum, a) => sum + a.royalties, 0)
    const avgBooksPerAuthor = totalAuthors > 0 ? Number((totalBooksPublished / totalAuthors).toFixed(1)) : 0

    const totalDistributors = wholesaleData.length
    const totalWholesaleOrders = wholesaleOrders.length
    const wholesaleRevenue = wholesaleData.reduce((sum, w) => sum + w.total, 0)
    const avgWholesaleOrderValue = totalWholesaleOrders > 0 ? wholesaleRevenue / totalWholesaleOrders : 0

    const totalSchools = schoolMap.size
    const activeContracts = schoolContracts.filter((c) => c.status === 'active').length
    const totalContractValue = schoolContracts.reduce((sum, c) => sum + c.totalValue, 0)

    const totalIncome = totalRevenue
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
    const netProfit = totalIncome - totalExpenses
    const financialProfitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0

    return NextResponse.json({
      success: true,
      data: {
        // Sales
        monthlyRevenue,
        topProducts,
        salesByPayment,
        salesStats: {
          totalRevenue: Math.round(totalRevenue),
          totalOrders,
          avgOrderValue: Math.round(avgOrderValue * 100) / 100,
          profitMargin: Math.round(profitMargin * 10) / 10,
        },
        // Inventory
        stockLevels,
        movingItems,
        inventoryStats: {
          totalSKUs,
          lowStockCount,
          outOfStockCount,
          deadStockCount,
        },
        // Publisher
        publisherData,
        publisherStats: {
          totalPublishers,
          totalTitles,
          publisherRevenue: Math.round(publisherRevenue),
          avgOrdersPerPublisher,
        },
        // Author
        authorData,
        authorStats: {
          totalAuthors,
          totalBooksPublished,
          totalRoyalties: Math.round(totalRoyalties),
          avgBooksPerAuthor,
        },
        // Wholesale
        wholesaleData,
        wholesaleStats: {
          totalDistributors,
          totalWholesaleOrders,
          wholesaleRevenue: Math.round(wholesaleRevenue),
          avgWholesaleOrderValue: Math.round(avgWholesaleOrderValue),
        },
        // School
        schoolContractData,
        schoolStats: {
          totalSchools,
          activeContracts,
          totalContractValue: Math.round(totalContractValue),
        },
        // Financial
        financialSummary,
        financialStats: {
          totalIncome: Math.round(totalIncome),
          totalExpenses: Math.round(totalExpenses),
          netProfit: Math.round(netProfit),
          profitMargin: Math.round(financialProfitMargin * 10) / 10,
        },
      },
    })
  } catch (error) {
    console.error('Reports API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate reports' },
      { status: 500 }
    )
  }
}
