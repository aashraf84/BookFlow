import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET: Fetch accounts, journal entries, or expenses based on ?type=
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'accounts';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    switch (type) {
      case 'accounts': {
        const [accounts, total] = await Promise.all([
          db.account.findMany({
            where: { isActive: true },
            orderBy: { code: 'asc' },
            skip,
            take: limit,
          }),
          db.account.count({ where: { isActive: true } }),
        ]);
        return NextResponse.json({
          data: accounts,
          pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
      }

      case 'entries': {
        const [entries, total] = await Promise.all([
          db.journalEntry.findMany({
            include: {
              lines: {
                include: {
                  account: { select: { id: true, code: true, name: true, type: true } },
                },
              },
            },
            orderBy: { date: 'desc' },
            skip,
            take: limit,
          }),
          db.journalEntry.count(),
        ]);
        return NextResponse.json({
          data: entries,
          pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
      }

      case 'expenses': {
        const status = searchParams.get('status') || '';
        const category = searchParams.get('category') || '';

        const where: Record<string, unknown> = {};
        if (status) where.status = status;
        if (category) where.category = { contains: category };

        const [expenses, total] = await Promise.all([
          db.expense.findMany({
            where,
            orderBy: { date: 'desc' },
            skip,
            take: limit,
          }),
          db.expense.count({ where }),
        ]);
        return NextResponse.json({
          data: expenses,
          pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid type. Use accounts, entries, or expenses' }, { status: 400 });
    }
  } catch (error) {
    console.error('Finance GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch finance data' }, { status: 500 });
  }
}

// POST: Create accounts, journal entries, or expenses based on ?type=
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'accounts';
    const body = await request.json();

    switch (type) {
      case 'accounts': {
        const { code, name, type: accountType, parentCode, balance } = body;
        if (!code || !name || !accountType) {
          return NextResponse.json(
            { error: 'Code, name, and type are required' },
            { status: 400 }
          );
        }

        const existing = await db.account.findUnique({ where: { code } });
        if (existing) {
          return NextResponse.json({ error: 'Account code already exists' }, { status: 409 });
        }

        const account = await db.account.create({
          data: { code, name, type: accountType, parentCode, balance: balance || 0 },
        });
        return NextResponse.json({ data: account }, { status: 201 });
      }

      case 'entries': {
        const { date, description, reference, isPosted, lines } = body;
        if (!date || !description || !lines || !Array.isArray(lines) || lines.length === 0) {
          return NextResponse.json(
            { error: 'Date, description, and lines are required' },
            { status: 400 }
          );
        }

        // Validate double-entry: total debits must equal total credits
        const totalDebit = lines.reduce((sum: number, l: { debit?: number }) => sum + (l.debit || 0), 0);
        const totalCredit = lines.reduce((sum: number, l: { credit?: number }) => sum + (l.credit || 0), 0);

        if (Math.abs(totalDebit - totalCredit) > 0.01) {
          return NextResponse.json(
            { error: 'Total debits must equal total credits' },
            { status: 400 }
          );
        }

        const entry = await db.journalEntry.create({
          data: {
            date: new Date(date),
            description,
            reference,
            isPosted: isPosted || false,
            lines: {
              create: lines.map((line: { accountId: string; debit?: number; credit?: number; description?: string }) => ({
                accountId: line.accountId,
                debit: line.debit || 0,
                credit: line.credit || 0,
                description: line.description,
              })),
            },
          },
          include: {
            lines: {
              include: {
                account: { select: { code: true, name: true, type: true } },
              },
            },
          },
        });

        // Update account balances if posted
        if (isPosted) {
          for (const line of lines) {
            const account = await db.account.findUnique({ where: { id: line.accountId } });
            if (account) {
              const debit = line.debit || 0;
              const credit = line.credit || 0;
              // Asset/Expense: debit increases, credit decreases
              // Liability/Equity/Revenue: credit increases, debit decreases
              const isDebitAccount = account.type === 'asset' || account.type === 'expense';
              const balanceChange = isDebitAccount ? debit - credit : credit - debit;
              await db.account.update({
                where: { id: account.id },
                data: { balance: account.balance + balanceChange },
              });
            }
          }
        }

        return NextResponse.json({ data: entry }, { status: 201 });
      }

      case 'expenses': {
        const { category, amount, date, description, paidBy, receipt, status } = body;
        if (!category || !amount || !date) {
          return NextResponse.json(
            { error: 'Category, amount, and date are required' },
            { status: 400 }
          );
        }

        const expense = await db.expense.create({
          data: {
            category,
            amount,
            date: new Date(date),
            description,
            paidBy,
            receipt,
            status: status || 'pending',
          },
        });
        return NextResponse.json({ data: expense }, { status: 201 });
      }

      default:
        return NextResponse.json({ error: 'Invalid type. Use accounts, entries, or expenses' }, { status: 400 });
    }
  } catch (error) {
    console.error('Finance POST error:', error);
    return NextResponse.json({ error: 'Failed to create finance record' }, { status: 500 });
  }
}
