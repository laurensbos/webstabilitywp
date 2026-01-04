import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, sites, sslCertificates, performanceMetrics } from '@/lib/db';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all sites for user
    const userSites = await db
      .select()
      .from(sites)
      .where(eq(sites.userId, session.user.id))
      .orderBy(sites.createdAt);

    // Get SSL and performance data for each site
    const sitesWithDetails = await Promise.all(
      userSites.map(async (site) => {
        // Get latest SSL certificate
        const [sslCert] = await db
          .select()
          .from(sslCertificates)
          .where(eq(sslCertificates.siteId, site.id))
          .orderBy(desc(sslCertificates.lastCheckedAt))
          .limit(1);

        // Get latest performance metrics
        const [perfMetric] = await db
          .select()
          .from(performanceMetrics)
          .where(eq(performanceMetrics.siteId, site.id))
          .orderBy(desc(performanceMetrics.createdAt))
          .limit(1);

        return {
          ...site,
          ssl: sslCert ? {
            issuer: sslCert.issuer,
            validTo: sslCert.validTo,
            daysUntilExpiry: sslCert.daysUntilExpiry,
            isValid: sslCert.isValid,
          } : null,
          performance: perfMetric ? {
            score: perfMetric.performanceScore,
            accessibility: perfMetric.accessibilityScore,
            bestPractices: perfMetric.bestPracticesScore,
            seo: perfMetric.seoScore,
          } : null,
        };
      })
    );

    return NextResponse.json({ sites: sitesWithDetails });
  } catch (error) {
    console.error('Error fetching sites with details:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
