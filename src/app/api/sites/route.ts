import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, sites } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { getPlan, canAddSite, getCheckInterval } from '@/lib/plans';
import { performSSLCheck } from '@/lib/monitoring/ssl';
import { performUptimeCheck } from '@/lib/monitoring/uptime';
import { performPerformanceCheck } from '@/lib/monitoring/performance';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userSites = await db
      .select()
      .from(sites)
      .where(eq(sites.userId, session.user.id))
      .orderBy(sites.createdAt);

    return NextResponse.json({ sites: userSites });
  } catch (error) {
    console.error('Error fetching sites:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { url, name } = await request.json();

    if (!url || !name) {
      return NextResponse.json(
        { error: 'URL en naam zijn verplicht' },
        { status: 400 }
      );
    }

    // Validate URL
    let validUrl: string;
    try {
      const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
      validUrl = parsed.href;
    } catch {
      return NextResponse.json(
        { error: 'Ongeldige URL' },
        { status: 400 }
      );
    }

    // Check site limit
    const currentSites = await db
      .select()
      .from(sites)
      .where(eq(sites.userId, session.user.id));

    const plan = (session.user as { plan?: string }).plan;
    if (!canAddSite(currentSites.length, plan)) {
      const userPlan = getPlan(plan);
      return NextResponse.json(
        { error: `Je hebt het maximum aantal sites (${userPlan.sites}) bereikt. Upgrade je plan voor meer sites.` },
        { status: 403 }
      );
    }

    // Check if URL already exists for this user
    const existingSite = await db
      .select()
      .from(sites)
      .where(and(eq(sites.userId, session.user.id), eq(sites.url, validUrl)));

    if (existingSite.length > 0) {
      return NextResponse.json(
        { error: 'Deze site monitor je al' },
        { status: 400 }
      );
    }

    // Create site
    const checkInterval = getCheckInterval(plan);
    const [site] = await db
      .insert(sites)
      .values({
        userId: session.user.id,
        url: validUrl,
        name,
        checkInterval,
      })
      .returning();

    // Perform ALL initial checks - await them so data is ready when user views site
    // Run in parallel for speed
    const [uptimeResult, sslResult, performanceResult] = await Promise.allSettled([
      performUptimeCheck(site.id),
      performSSLCheck(site.id),
      performPerformanceCheck(site.id),
    ]);

    // Log any failures but don't fail the request
    if (uptimeResult.status === 'rejected') {
      console.error('Initial uptime check failed:', uptimeResult.reason);
    }
    if (sslResult.status === 'rejected') {
      console.error('Initial SSL check failed:', sslResult.reason);
    }
    if (performanceResult.status === 'rejected') {
      console.error('Initial performance check failed:', performanceResult.reason);
    }

    // Fetch the updated site with current status
    const [updatedSite] = await db
      .select()
      .from(sites)
      .where(eq(sites.id, site.id));

    return NextResponse.json({ 
      site: updatedSite,
      initialChecks: {
        uptime: uptimeResult.status === 'fulfilled',
        ssl: sslResult.status === 'fulfilled',
        performance: performanceResult.status === 'fulfilled',
      }
    });
  } catch (error) {
    console.error('Error creating site:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get('id');

    if (!siteId) {
      return NextResponse.json({ error: 'Site ID is verplicht' }, { status: 400 });
    }

    // Check ownership
    const [site] = await db
      .select()
      .from(sites)
      .where(and(eq(sites.id, siteId), eq(sites.userId, session.user.id)));

    if (!site) {
      return NextResponse.json({ error: 'Site niet gevonden' }, { status: 404 });
    }

    await db.delete(sites).where(eq(sites.id, siteId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting site:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
