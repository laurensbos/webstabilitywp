import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, sites, performanceMetrics } from '@/lib/db';
import { eq, and, desc } from 'drizzle-orm';
import { checkPerformance } from '@/lib/monitoring/performance';

// GET - Fetch performance metrics for a site
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

    // Verify ownership
    const [site] = await db
      .select()
      .from(sites)
      .where(and(eq(sites.id, id), eq(sites.userId, session.user.id)));

    if (!site) {
      return NextResponse.json({ error: 'Site niet gevonden' }, { status: 404 });
    }

    // Get latest performance metrics
    const metrics = await db
      .select()
      .from(performanceMetrics)
      .where(eq(performanceMetrics.siteId, id))
      .orderBy(desc(performanceMetrics.createdAt))
      .limit(30);

    const latest = metrics[0] || null;

    return NextResponse.json({
      latest,
      history: metrics,
    });
  } catch (error) {
    console.error('Error fetching performance:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST - Run a new performance check
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const [site] = await db
      .select()
      .from(sites)
      .where(and(eq(sites.id, id), eq(sites.userId, session.user.id)));

    if (!site) {
      return NextResponse.json({ error: 'Site niet gevonden' }, { status: 404 });
    }

    // Run performance check
    const result = await checkPerformance(site.url);

    if (!result) {
      return NextResponse.json(
        { error: 'Performance check mislukt. Controleer of PAGESPEED_API_KEY is ingesteld.' },
        { status: 500 }
      );
    }

    // Save to database
    const [metric] = await db.insert(performanceMetrics).values({
      siteId: id,
      performanceScore: result.performanceScore,
      accessibilityScore: result.accessibilityScore,
      bestPracticesScore: result.bestPracticesScore,
      seoScore: result.seoScore,
      lcp: result.lcp.toString(),
      fid: result.fid.toString(),
      cls: result.cls.toString(),
      ttfb: result.ttfb.toString(),
    }).returning();

    return NextResponse.json({ metric });
  } catch (error) {
    console.error('Error running performance check:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
