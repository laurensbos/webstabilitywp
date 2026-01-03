import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, maintenanceWindows, sites } from '@/lib/db';
import { eq, and, gte, desc } from 'drizzle-orm';

// GET /api/maintenance - Get all maintenance windows for user
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const windows = await db
      .select({
        window: maintenanceWindows,
        siteName: sites.name,
        siteUrl: sites.url,
      })
      .from(maintenanceWindows)
      .leftJoin(sites, eq(maintenanceWindows.siteId, sites.id))
      .where(eq(maintenanceWindows.userId, session.user.id))
      .orderBy(desc(maintenanceWindows.startsAt));

    return NextResponse.json(
      windows.map(({ window, siteName, siteUrl }) => ({
        ...window,
        siteName,
        siteUrl,
      }))
    );
  } catch (error) {
    console.error('Error fetching maintenance windows:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST /api/maintenance - Create maintenance window
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { siteId, title, description, startsAt, endsAt } = await request.json();

    if (!siteId || !title || !startsAt || !endsAt) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate site belongs to user
    const [site] = await db
      .select()
      .from(sites)
      .where(and(eq(sites.id, siteId), eq(sites.userId, session.user.id)));

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    const [window] = await db
      .insert(maintenanceWindows)
      .values({
        siteId,
        userId: session.user.id,
        title,
        description,
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
        isActive: true,
      })
      .returning();

    return NextResponse.json(window);
  } catch (error) {
    console.error('Error creating maintenance window:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
