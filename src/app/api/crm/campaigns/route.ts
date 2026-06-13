import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const campaigns = await db.campaign.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ data: campaigns });
  } catch (error) {
    console.error('Campaigns GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, target, message, scheduledAt } = body;

    if (!name || !message) {
      return NextResponse.json({ error: 'Name and message are required' }, { status: 400 });
    }

    const campaign = await db.campaign.create({
      data: {
        name,
        type: type || 'email',
        target,
        message,
        status: scheduledAt ? 'scheduled' : 'draft',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      },
    });

    return NextResponse.json({ data: campaign }, { status: 201 });
  } catch (error) {
    console.error('Campaigns POST error:', error);
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, type, target, message, status, scheduledAt } = body;

    if (!id) {
      return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 });
    }

    const existing = await db.campaign.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const campaign = await db.campaign.update({
      where: { id },
      data: {
        name,
        type,
        target,
        message,
        status,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        sentAt: status === 'sent' ? new Date() : undefined,
      },
    });

    return NextResponse.json({ data: campaign });
  } catch (error) {
    console.error('Campaigns PUT error:', error);
    return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 });
    }

    await db.campaign.delete({ where: { id } });
    return NextResponse.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Campaigns DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete campaign' }, { status: 500 });
  }
}
