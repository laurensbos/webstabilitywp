import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, incidents, sites } from '@/lib/db';
import { eq, desc, and } from 'drizzle-orm';

// GET /api/incidents - Get all incidents for user
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get('siteId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    let conditions = [eq(incidents.userId, session.user.id)];
    
    if (siteId) {
      conditions.push(eq(incidents.siteId, siteId));
    }
    
    if (status) {
      conditions.push(eq(incidents.status, status));
    }

    const userIncidents = await db
      .select({
        incident: incidents,
        siteName: sites.name,
        siteUrl: sites.url,
      })
      .from(incidents)
      .leftJoin(sites, eq(incidents.siteId, sites.id))
      .where(and(...conditions))
      .orderBy(desc(incidents.startedAt))
      .limit(limit);

    return NextResponse.json(
      userIncidents.map(({ incident, siteName, siteUrl }) => ({
        ...incident,
        siteName,
        siteUrl,
      }))
    );
  } catch (error) {
    console.error('Error fetching incidents:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST /api/incidents - Create incident (internal use)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { siteId, errorMessage, httpStatus, screenshotUrl } = await request.json();

    if (!siteId) {
      return NextResponse.json({ error: 'Site ID required' }, { status: 400 });
    }

    // Check site belongs to user
    const [site] = await db
      .select()
      .from(sites)
      .where(and(eq(sites.id, siteId), eq(sites.userId, session.user.id)));

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    const [incident] = await db
      .insert(incidents)
      .values({
        siteId,
        userId: session.user.id,
        errorMessage,
        httpStatus,
        screenshotUrl,
        status: 'ongoing',
      })
      .returning();

    return NextResponse.json(incident);
  } catch (error) {
    console.error('Error creating incident:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
