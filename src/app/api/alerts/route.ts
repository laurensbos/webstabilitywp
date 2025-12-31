import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, alerts } from '@/lib/db';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userAlerts = await db
      .select()
      .from(alerts)
      .where(eq(alerts.userId, session.user.id))
      .orderBy(desc(alerts.createdAt))
      .limit(50);

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

    const { alertId, isRead } = await request.json();

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
