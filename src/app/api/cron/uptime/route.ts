import { NextRequest, NextResponse } from 'next/server';
import { db, sites } from '@/lib/db';
import { eq, lte } from 'drizzle-orm';
import { performUptimeCheck } from '@/lib/monitoring/uptime';

// This endpoint is called by Vercel Cron
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || process.env.RON_SECRET;
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all active sites that need checking
    const now = new Date();
    const allSites = await db
      .select()
      .from(sites)
      .where(eq(sites.isActive, true));

    // Filter sites that need checking based on their interval
    const sitesToCheck = allSites.filter(site => {
      if (!site.lastCheckedAt) return true;
      
      const lastCheck = new Date(site.lastCheckedAt);
      const intervalMs = (site.checkInterval || 5) * 60 * 1000;
      return now.getTime() - lastCheck.getTime() >= intervalMs;
    });

    // Check all sites (in batches to avoid timeout)
    const batchSize = 10;
    const results = [];

    for (let i = 0; i < sitesToCheck.length; i += batchSize) {
      const batch = sitesToCheck.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(site => performUptimeCheck(site.id))
      );
      results.push(...batchResults);
    }

    return NextResponse.json({
      checked: results.length,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error('Cron error:', error);
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 });
  }
}
