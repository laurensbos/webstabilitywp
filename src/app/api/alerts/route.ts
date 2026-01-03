import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, alerts } from '@/lib/db';
import { eq, desc, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get('siteId');

    // Build query conditions
    const conditions = [eq(alerts.userId, session.user.id)];
    if (siteId) {
      conditions.push(eq(alerts.siteId, siteId));
    }

    const userAlerts = await db
      .select()
      .from(alerts)
      .where(and(...conditions))
      .orderBy(desc(alerts.createdAt))
      .limit(siteId ? 20 : 50);

    return NextResponse.json({ alerts: userAlerts });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { alertId, isRead, markAllRead } = await request.json();

    // Mark all alerts as read
    if (markAllRead) {
      await db
        .update(alerts)
        .set({ isRead: true })
        .where(eq(alerts.userId, session.user.id));

      return NextResponse.json({ success: true, message: 'Alle meldingen als gelezen gemarkeerd' });
    }

    // Mark single alert
    if (!alertId) {
      return NextResponse.json({ error: 'Alert ID is verplicht' }, { status: 400 });
    }

    await db
      .update(alerts)
      .set({ isRead: isRead ?? true })
      .where(eq(alerts.id, alertId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating alert:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
