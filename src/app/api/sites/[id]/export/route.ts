import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, sites, uptimeChecks, performanceMetrics } from '@/lib/db';
import { eq, and, desc, gte } from 'drizzle-orm';

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
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const type = searchParams.get('type') || 'uptime'; // uptime, performance
    const days = parseInt(searchParams.get('days') || '30');

    // Verify ownership
    const [site] = await db
      .select()
      .from(sites)
      .where(and(eq(sites.id, id), eq(sites.userId, session.user.id)));

    if (!site) {
      return NextResponse.json({ error: 'Site niet gevonden' }, { status: 404 });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    if (type === 'uptime') {
      // Get uptime checks
      const checks = await db
        .select()
        .from(uptimeChecks)
        .where(and(
          eq(uptimeChecks.siteId, id),
          gte(uptimeChecks.checkedAt, startDate)
        ))
        .orderBy(desc(uptimeChecks.checkedAt));

      if (format === 'csv') {
        const csvHeader = 'Datum,Tijd,Status,Response Time (ms),HTTP Status,Error\n';
        const csvRows = checks.map(check => {
          const date = new Date(check.checkedAt!);
          return [
            date.toLocaleDateString('nl-NL'),
            date.toLocaleTimeString('nl-NL'),
            check.isUp ? 'Online' : 'Offline',
            check.responseTime || '',
            check.status || '',
            check.error ? `"${check.error.replace(/"/g, '""')}"` : ''
          ].join(',');
        }).join('\n');

        const csv = csvHeader + csvRows;
        
        return new NextResponse(csv, {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="${site.name.replace(/[^a-z0-9]/gi, '_')}_uptime_${days}days.csv"`,
          },
        });
      }

      return NextResponse.json({ checks });
    }

    if (type === 'performance') {
      // Get performance metrics
      const metrics = await db
        .select()
        .from(performanceMetrics)
        .where(and(
          eq(performanceMetrics.siteId, id),
          gte(performanceMetrics.createdAt, startDate)
        ))
        .orderBy(desc(performanceMetrics.createdAt));

      if (format === 'csv') {
        const csvHeader = 'Datum,Tijd,Performance,Accessibility,Best Practices,SEO,LCP (ms),FID (ms),CLS,TTFB (ms)\n';
        const csvRows = metrics.map(metric => {
          const date = new Date(metric.createdAt!);
          return [
            date.toLocaleDateString('nl-NL'),
            date.toLocaleTimeString('nl-NL'),
            metric.performanceScore || '',
            metric.accessibilityScore || '',
            metric.bestPracticesScore || '',
            metric.seoScore || '',
            metric.lcp ? parseFloat(metric.lcp).toFixed(0) : '',
            metric.fid ? parseFloat(metric.fid).toFixed(0) : '',
            metric.cls ? parseFloat(metric.cls).toFixed(4) : '',
            metric.ttfb ? parseFloat(metric.ttfb).toFixed(0) : '',
          ].join(',');
        }).join('\n');

        const csv = csvHeader + csvRows;
        
        return new NextResponse(csv, {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="${site.name.replace(/[^a-z0-9]/gi, '_')}_performance_${days}days.csv"`,
          },
        });
      }

      return NextResponse.json({ metrics });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
