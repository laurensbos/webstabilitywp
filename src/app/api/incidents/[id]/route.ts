import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, incidents, sites } from '@/lib/db';
import { eq, and } from 'drizzle-orm';

// GET /api/incidents/[id] - Get single incident
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const [incident] = await db
      .select({
        incident: incidents,
        siteName: sites.name,
        siteUrl: sites.url,
      })
      .from(incidents)
      .leftJoin(sites, eq(incidents.siteId, sites.id))
      .where(and(eq(incidents.id, id), eq(incidents.userId, session.user.id)));

    if (!incident) {
      return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...incident.incident,
      siteName: incident.siteName,
      siteUrl: incident.siteUrl,
    });
  } catch (error) {
    console.error('Error fetching incident:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// PATCH /api/incidents/[id] - Update incident (acknowledge, resolve, add cause)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { action, cause } = await request.json();

    // Check incident belongs to user
    const [existing] = await db
      .select()
      .from(incidents)
      .where(and(eq(incidents.id, id), eq(incidents.userId, session.user.id)));

    if (!existing) {
      return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
    }

    let updates: Partial<typeof incidents.$inferInsert> = {};

    if (action === 'acknowledge') {
      updates = {
        acknowledgedAt: new Date(),
        acknowledgedBy: session.user.name || session.user.email || 'Unknown',
        status: 'investigating',
      };
    } else if (action === 'resolve') {
      const duration = existing.startedAt 
        ? Math.floor((Date.now() - new Date(existing.startedAt).getTime()) / 1000)
        : null;
      updates = {
        resolvedAt: new Date(),
        status: 'resolved',
        duration,
        cause: cause || existing.cause,
      };
    } else if (cause) {
      updates = { cause };
    }

    const [updated] = await db
      .update(incidents)
      .set(updates)
      .where(eq(incidents.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating incident:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// DELETE /api/incidents/[id] - Delete incident
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await db
      .delete(incidents)
      .where(and(eq(incidents.id, id), eq(incidents.userId, session.user.id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting incident:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
