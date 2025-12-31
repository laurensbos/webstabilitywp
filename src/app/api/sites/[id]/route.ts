import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, sites, uptimeChecks } from '@/lib/db';
import { eq, and, desc } from 'drizzle-orm';
import { getUptimeStats } from '@/lib/monitoring/uptime';
import { getLatestPerformance } from '@/lib/monitoring/performance';
import { getSSLStatus } from '@/lib/monitoring/ssl';

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

    // Get site and verify ownership
    const [site] = await db
      .select()
      .from(sites)
      .where(and(eq(sites.id, id), eq(sites.userId, session.user.id)));

    if (!site) {
      return NextResponse.json({ error: 'Site niet gevonden' }, { status: 404 });
    }

    // Get all stats
    const [uptimeStats, performance, ssl, recentChecks] = await Promise.all([
      getUptimeStats(id, 30),
      getLatestPerformance(id),
      getSSLStatus(id),
      db
        .select()
        .from(uptimeChecks)
        .where(eq(uptimeChecks.siteId, id))
        .orderBy(desc(uptimeChecks.checkedAt))
        .limit(100),
    ]);

    return NextResponse.json({
      site,
      uptime: uptimeStats,
      performance,
      ssl,
      recentChecks,
    });
  } catch (error) {
    console.error('Error fetching site details:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

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
    const body = await request.json();

    // Verify ownership
    const [site] = await db
      .select()
      .from(sites)
      .where(and(eq(sites.id, id), eq(sites.userId, session.user.id)));

    if (!site) {
      return NextResponse.json({ error: 'Site niet gevonden' }, { status: 404 });
    }

    // Update site
    const [updatedSite] = await db
      .update(sites)
      .set({
        name: body.name ?? site.name,
        isActive: body.isActive ?? site.isActive,
        updatedAt: new Date(),
      })
      .where(eq(sites.id, id))
      .returning();

    return NextResponse.json({ site: updatedSite });
  } catch (error) {
    console.error('Error updating site:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
