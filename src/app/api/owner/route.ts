import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET: Fetch owner module data based on ?type=
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'clients';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;
    const search = searchParams.get('search') || '';

    switch (type) {
      case 'clients': {
        const where: Record<string, unknown> = {};
        if (search) {
          where.OR = [
            { companyName: { contains: search } },
            { contactPerson: { contains: search } },
            { email: { contains: search } },
          ];
        }
        const status = searchParams.get('status');
        if (status) where.status = status;

        const [clients, total] = await Promise.all([
          db.ownerClient.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
            include: {
              _count: { select: { subscriptions: true, invoices: true, devices: true, serialKeys: true } },
            },
          }),
          db.ownerClient.count({ where }),
        ]);
        return NextResponse.json({ data: clients, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
      }

      case 'subscriptions': {
        const where: Record<string, unknown> = {};
        if (search) {
          where.OR = [
            { planName: { contains: search } },
            { client: { companyName: { contains: search } } },
          ];
        }
        const status = searchParams.get('status');
        if (status) where.status = status;
        const clientId = searchParams.get('clientId');
        if (clientId) where.clientId = clientId;

        const [subscriptions, total] = await Promise.all([
          db.ownerSubscription.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
            include: { client: { select: { id: true, companyName: true, email: true } } },
          }),
          db.ownerSubscription.count({ where }),
        ]);
        return NextResponse.json({ data: subscriptions, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
      }

      case 'invoices': {
        const where: Record<string, unknown> = {};
        if (search) {
          where.OR = [
            { invoiceNumber: { contains: search } },
            { client: { companyName: { contains: search } } },
          ];
        }
        const status = searchParams.get('status');
        if (status) where.status = status;
        const clientId = searchParams.get('clientId');
        if (clientId) where.clientId = clientId;

        const [invoices, total] = await Promise.all([
          db.ownerInvoice.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
            include: {
              client: { select: { id: true, companyName: true, email: true, address: true, city: true, country: true, taxId: true } },
              items: true,
            },
          }),
          db.ownerInvoice.count({ where }),
        ]);
        return NextResponse.json({ data: invoices, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
      }

      case 'invoice-detail': {
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'Invoice ID required' }, { status: 400 });
        const invoice = await db.ownerInvoice.findUnique({
          where: { id },
          include: {
            client: true,
            items: true,
            subscription: true,
          },
        });
        if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        return NextResponse.json({ data: invoice });
      }

      case 'quotations': {
        const where: Record<string, unknown> = {};
        if (search) {
          where.OR = [
            { quotationNumber: { contains: search } },
            { client: { companyName: { contains: search } } },
          ];
        }
        const status = searchParams.get('status');
        if (status) where.status = status;
        const clientId = searchParams.get('clientId');
        if (clientId) where.clientId = clientId;

        const [quotations, total] = await Promise.all([
          db.ownerQuotation.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
            include: {
              client: { select: { id: true, companyName: true, email: true, address: true, city: true, country: true, taxId: true } },
              items: true,
            },
          }),
          db.ownerQuotation.count({ where }),
        ]);
        return NextResponse.json({ data: quotations, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
      }

      case 'quotation-detail': {
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'Quotation ID required' }, { status: 400 });
        const quotation = await db.ownerQuotation.findUnique({
          where: { id },
          include: { client: true, items: true },
        });
        if (!quotation) return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
        return NextResponse.json({ data: quotation });
      }

      case 'serial-keys': {
        const where: Record<string, unknown> = {};
        if (search) {
          where.OR = [
            { key: { contains: search } },
            { client: { companyName: { contains: search } } },
          ];
        }
        const clientId = searchParams.get('clientId');
        if (clientId) where.clientId = clientId;

        const [keys, total] = await Promise.all([
          db.ownerSerialKey.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
            include: { client: { select: { id: true, companyName: true } } },
          }),
          db.ownerSerialKey.count({ where }),
        ]);
        return NextResponse.json({ data: keys, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
      }

      case 'devices': {
        const where: Record<string, unknown> = {};
        if (search) {
          where.OR = [
            { deviceName: { contains: search } },
            { fingerprint: { contains: search } },
            { client: { companyName: { contains: search } } },
          ];
        }
        const clientId = searchParams.get('clientId');
        if (clientId) where.clientId = clientId;

        const [devices, total] = await Promise.all([
          db.ownerDevice.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
            include: { client: { select: { id: true, companyName: true } } },
          }),
          db.ownerDevice.count({ where }),
        ]);
        return NextResponse.json({ data: devices, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
      }

      case 'stats': {
        const [
          totalClients,
          activeClients,
          totalSubscriptions,
          activeSubscriptions,
          totalInvoices,
          paidInvoices,
          overdueInvoices,
          totalRevenue,
          totalQuotations,
          pendingQuotations,
          totalDevices,
          activeDevices,
          totalSerialKeys,
          activeSerialKeys,
        ] = await Promise.all([
          db.ownerClient.count(),
          db.ownerClient.count({ where: { status: 'active' } }),
          db.ownerSubscription.count(),
          db.ownerSubscription.count({ where: { status: 'active' } }),
          db.ownerInvoice.count(),
          db.ownerInvoice.count({ where: { status: 'paid' } }),
          db.ownerInvoice.count({ where: { status: 'overdue' } }),
          db.ownerInvoice.aggregate({ where: { status: 'paid' }, _sum: { total: true } }),
          db.ownerQuotation.count(),
          db.ownerQuotation.count({ where: { status: 'sent' } }),
          db.ownerDevice.count(),
          db.ownerDevice.count({ where: { isActive: true } }),
          db.ownerSerialKey.count(),
          db.ownerSerialKey.count({ where: { isActive: true } }),
        ]);

        return NextResponse.json({
          data: {
            totalClients,
            activeClients,
            churnedClients: totalClients - activeClients,
            totalSubscriptions,
            activeSubscriptions,
            totalInvoices,
            paidInvoices,
            overdueInvoices,
            totalRevenue: totalRevenue._sum.total || 0,
            totalQuotations,
            pendingQuotations,
            totalDevices,
            activeDevices,
            totalSerialKeys,
            activeSerialKeys,
          },
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Owner GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch owner data' }, { status: 500 });
  }
}

// POST: Create owner module data based on ?type=
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'clients';
    const body = await request.json();

    switch (type) {
      case 'clients': {
        const { companyName, contactPerson, email, phone, address, city, state, country, postalCode, taxId, website, industry, notes, status } = body;
        if (!companyName || !contactPerson || !email) {
          return NextResponse.json({ error: 'Company name, contact person, and email are required' }, { status: 400 });
        }
        const existing = await db.ownerClient.findUnique({ where: { email } });
        if (existing) return NextResponse.json({ error: 'Client with this email already exists' }, { status: 409 });

        const client = await db.ownerClient.create({
          data: { companyName, contactPerson, email, phone, address, city, state, country, postalCode, taxId, website, industry, notes, status: status || 'active' },
        });
        return NextResponse.json({ data: client }, { status: 201 });
      }

      case 'subscriptions': {
        const { clientId, planName, planType, price, currency, startDate, endDate, status, autoRenew, maxUsers, maxBranches, maxDevices, storageGB, features } = body;
        if (!clientId || !planName || !startDate) {
          return NextResponse.json({ error: 'Client, plan name, and start date are required' }, { status: 400 });
        }
        const sub = await db.ownerSubscription.create({
          data: { clientId, planName, planType: planType || 'monthly', price: price || 0, currency: currency || 'USD', startDate: new Date(startDate), endDate: endDate ? new Date(endDate) : null, status: status || 'active', autoRenew: autoRenew !== false, maxUsers: maxUsers || 5, maxBranches: maxBranches || 1, maxDevices: maxDevices || 3, storageGB: storageGB || 5, features },
          include: { client: true },
        });
        return NextResponse.json({ data: sub }, { status: 201 });
      }

      case 'invoices': {
        const { clientId, subscriptionId, issueDate, dueDate, items, discountAmount, taxRate, notes, terms, currency, status } = body;
        if (!clientId || !issueDate || !dueDate || !items || !Array.isArray(items) || items.length === 0) {
          return NextResponse.json({ error: 'Client, dates, and items are required' }, { status: 400 });
        }

        const subtotal = items.reduce((sum: number, i: { total: number }) => sum + (i.total || 0), 0);
        const disc = discountAmount || 0;
        const afterDiscount = subtotal - disc;
        const rate = taxRate || 0;
        const taxAmount = afterDiscount * (rate / 100);
        const total = afterDiscount + taxAmount;

        const count = await db.ownerInvoice.count();
        const invoiceNumber = `INV-${String(count + 1).padStart(5, '0')}`;

        const invoice = await db.ownerInvoice.create({
          data: {
            invoiceNumber, clientId, subscriptionId: subscriptionId || null, issueDate: new Date(issueDate), dueDate: new Date(dueDate),
            subtotal, discountAmount: disc, taxRate: rate, taxAmount, total, currency: currency || 'USD', status: status || 'draft', notes, terms,
            items: { create: items.map((i: { description: string; quantity: number; unitPrice: number; discount: number; total: number }) => ({ description: i.description, quantity: i.quantity || 1, unitPrice: i.unitPrice || 0, discount: i.discount || 0, total: i.total || 0 })) },
          },
          include: { client: true, items: true },
        });
        return NextResponse.json({ data: invoice }, { status: 201 });
      }

      case 'quotations': {
        const { clientId, issueDate, validUntil, items, discountAmount, taxRate, notes, terms, currency, status } = body;
        if (!clientId || !issueDate || !validUntil || !items || !Array.isArray(items) || items.length === 0) {
          return NextResponse.json({ error: 'Client, dates, and items are required' }, { status: 400 });
        }

        const subtotal = items.reduce((sum: number, i: { total: number }) => sum + (i.total || 0), 0);
        const disc = discountAmount || 0;
        const afterDiscount = subtotal - disc;
        const rate = taxRate || 0;
        const taxAmount = afterDiscount * (rate / 100);
        const total = afterDiscount + taxAmount;

        const count = await db.ownerQuotation.count();
        const quotationNumber = `QUO-${String(count + 1).padStart(5, '0')}`;

        const quotation = await db.ownerQuotation.create({
          data: {
            quotationNumber, clientId, issueDate: new Date(issueDate), validUntil: new Date(validUntil),
            subtotal, discountAmount: disc, taxRate: rate, taxAmount, total, currency: currency || 'USD', status: status || 'draft', notes, terms,
            items: { create: items.map((i: { description: string; quantity: number; unitPrice: number; discount: number; total: number }) => ({ description: i.description, quantity: i.quantity || 1, unitPrice: i.unitPrice || 0, discount: i.discount || 0, total: i.total || 0 })) },
          },
          include: { client: true, items: true },
        });
        return NextResponse.json({ data: quotation }, { status: 201 });
      }

      case 'serial-keys': {
        const { clientId, plan, maxDevices, maxUsers, expiresAt, notes } = body;
        // Generate a serial key
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        const seg = () => Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
        const key = `${seg()}-${seg()}-${seg()}-${seg()}`;

        const serialKey = await db.ownerSerialKey.create({
          data: { key, clientId: clientId || null, plan: plan || 'professional', maxDevices: maxDevices || 3, maxUsers: maxUsers || 5, expiresAt: expiresAt ? new Date(expiresAt) : null, notes },
          include: { client: true },
        });
        return NextResponse.json({ data: serialKey }, { status: 201 });
      }

      case 'devices': {
        const { clientId, deviceName, deviceType, os, browser, fingerprint, ipAddress, serialKeyId } = body;
        if (!clientId) return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });

        const device = await db.ownerDevice.create({
          data: { clientId, deviceName, deviceType, os, browser, fingerprint, ipAddress, serialKeyId },
          include: { client: true },
        });
        return NextResponse.json({ data: device }, { status: 201 });
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Owner POST error:', error);
    return NextResponse.json({ error: 'Failed to create owner record' }, { status: 500 });
  }
}

// PUT: Update owner module data
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'clients';
    const body = await request.json();

    switch (type) {
      case 'clients': {
        const { id, ...data } = body;
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        const client = await db.ownerClient.update({ where: { id }, data });
        return NextResponse.json({ data: client });
      }

      case 'subscriptions': {
        const { id, ...data } = body;
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        if (data.startDate) data.startDate = new Date(data.startDate);
        if (data.endDate) data.endDate = new Date(data.endDate);
        const sub = await db.ownerSubscription.update({ where: { id }, data, include: { client: true } });
        return NextResponse.json({ data: sub });
      }

      case 'invoices': {
        const { id, status, paymentMethod, paymentRef, paidAt } = body;
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        const updateData: Record<string, unknown> = {};
        if (status) updateData.status = status;
        if (paymentMethod) updateData.paymentMethod = paymentMethod;
        if (paymentRef) updateData.paymentRef = paymentRef;
        if (paidAt) updateData.paidAt = new Date(paidAt);
        if (status === 'paid') updateData.paidAt = new Date();
        const invoice = await db.ownerInvoice.update({ where: { id }, data: updateData, include: { client: true, items: true } });
        return NextResponse.json({ data: invoice });
      }

      case 'quotations': {
        const { id, status, convertedInvoiceId } = body;
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        const updateData: Record<string, unknown> = {};
        if (status) updateData.status = status;
        if (convertedInvoiceId) updateData.convertedInvoiceId = convertedInvoiceId;
        const quotation = await db.ownerQuotation.update({ where: { id }, data: updateData, include: { client: true, items: true } });
        return NextResponse.json({ data: quotation });
      }

      case 'serial-keys': {
        const { id, ...data } = body;
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        if (data.activatedAt) data.activatedAt = new Date(data.activatedAt);
        if (data.expiresAt) data.expiresAt = new Date(data.expiresAt);
        const key = await db.ownerSerialKey.update({ where: { id }, data, include: { client: true } });
        return NextResponse.json({ data: key });
      }

      case 'devices': {
        const { id, ...data } = body;
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        if (data.lastActiveAt) data.lastActiveAt = new Date(data.lastActiveAt);
        const device = await db.ownerDevice.update({ where: { id }, data, include: { client: true } });
        return NextResponse.json({ data: device });
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Owner PUT error:', error);
    return NextResponse.json({ error: 'Failed to update owner record' }, { status: 500 });
  }
}

// DELETE: Delete owner module data
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'clients';
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    switch (type) {
      case 'clients':
        await db.ownerClient.delete({ where: { id } });
        return NextResponse.json({ success: true });

      case 'subscriptions':
        await db.ownerSubscription.delete({ where: { id } });
        return NextResponse.json({ success: true });

      case 'invoices':
        await db.ownerInvoice.delete({ where: { id } });
        return NextResponse.json({ success: true });

      case 'quotations':
        await db.ownerQuotation.delete({ where: { id } });
        return NextResponse.json({ success: true });

      case 'serial-keys':
        await db.ownerSerialKey.delete({ where: { id } });
        return NextResponse.json({ success: true });

      case 'devices':
        await db.ownerDevice.delete({ where: { id } });
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Owner DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete owner record' }, { status: 500 });
  }
}
