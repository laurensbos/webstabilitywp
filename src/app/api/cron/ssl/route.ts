import { NextRequest, NextResponse } from 'next/server';
import { db, sites, sslCertificates, alerts, users } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { checkSSL } from '@/lib/monitoring/ssl';
import { triggerWebhooks } from '@/lib/webhooks';
import { sendSSLWarningEmail } from '@/lib/email';

// This endpoint is called by Vercel Cron (daily at 3:00 AM)
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all active sites
    const allSites = await db
      .select()
      .from(sites)
      .where(eq(sites.isActive, true));

    const results = [];
    const alertsToCreate = [];

    for (const site of allSites) {
      try {
        // Extract hostname from URL
        const url = new URL(site.url);
        const hostname = url.hostname;

        // Check SSL certificate
        const sslInfo = await checkSSL(hostname);

        // Upsert SSL certificate record
        const existingCert = await db
          .select()
          .from(sslCertificates)
          .where(eq(sslCertificates.siteId, site.id))
          .limit(1);

        if (existingCert.length > 0) {
          await db
            .update(sslCertificates)
            .set({
              issuer: sslInfo.issuer,
              validFrom: sslInfo.validFrom,
              validTo: sslInfo.validTo,
              daysUntilExpiry: sslInfo.daysUntilExpiry,
              isValid: sslInfo.isValid,
              lastCheckedAt: new Date(),
            })
            .where(eq(sslCertificates.siteId, site.id));
        } else {
          await db.insert(sslCertificates).values({
            siteId: site.id,
            issuer: sslInfo.issuer,
            validFrom: sslInfo.validFrom,
            validTo: sslInfo.validTo,
            daysUntilExpiry: sslInfo.daysUntilExpiry,
            isValid: sslInfo.isValid,
            lastCheckedAt: new Date(),
          });
        }

        // Create alerts for expiring or invalid certificates
        if (!sslInfo.isValid) {
          alertsToCreate.push({
            siteId: site.id,
            userId: site.userId,
            type: 'ssl_expired' as const,
            title: `SSL certificaat verlopen: ${site.name}`,
            message: `Het SSL certificaat voor ${site.url} is verlopen of ongeldig.`,
            severity: 'critical' as const,
          });
        } else if (sslInfo.daysUntilExpiry <= 14) {
          alertsToCreate.push({
            siteId: site.id,
            userId: site.userId,
            type: 'ssl_expiry' as const,
            title: `SSL certificaat verloopt binnenkort: ${site.name}`,
            message: `Het SSL certificaat voor ${site.url} verloopt over ${sslInfo.daysUntilExpiry} dagen.`,
            severity: 'warning' as const,
          });
        } else if (sslInfo.daysUntilExpiry <= 30) {
          alertsToCreate.push({
            siteId: site.id,
            userId: site.userId,
            type: 'ssl_expiry' as const,
            title: `SSL certificaat verloopt over 30 dagen: ${site.name}`,
            message: `Het SSL certificaat voor ${site.url} verloopt over ${sslInfo.daysUntilExpiry} dagen.`,
            severity: 'info' as const,
          });
        }

        results.push({
          siteId: site.id,
          siteName: site.name,
          daysUntilExpiry: sslInfo.daysUntilExpiry,
          isValid: sslInfo.isValid,
        });
      } catch (error) {
        console.error(`SSL check failed for ${site.url}:`, error);
        results.push({
          siteId: site.id,
          siteName: site.name,
          error: (error as Error).message,
        });
      }
    }

    // Insert alerts (avoiding duplicates by checking recent alerts)
    for (const alert of alertsToCreate) {
      // Check if similar alert exists in last 24 hours
      const existingAlerts = await db
        .select()
        .from(alerts)
        .where(eq(alerts.siteId, alert.siteId))
        .limit(10);

      const recentSimilar = existingAlerts.find(a => 
        a.type === alert.type && 
        a.createdAt &&
        new Date(a.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000
      );

      if (!recentSimilar) {
        await db.insert(alerts).values(alert);
        
        // Get user for email
        const site = allSites.find(s => s.id === alert.siteId);
        if (site) {
          // Trigger webhooks for SSL alerts
          await triggerWebhooks(alert.userId, {
            siteName: site.name,
            siteUrl: site.url,
            status: alert.type === 'ssl_expired' ? 'ssl_expired' : 'ssl_expiring',
            message: alert.message,
            timestamp: new Date(),
          });
          
          // Send email notification (check user preferences)
          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, alert.userId))
            .limit(1);
          
          if (user?.email && (user.notifySslExpiry ?? true)) {
            const sslCert = await db
              .select()
              .from(sslCertificates)
              .where(eq(sslCertificates.siteId, site.id))
              .limit(1);
            
            if (sslCert[0]) {
              await sendSSLWarningEmail(
                user.alertEmail || user.email,
                site.name,
                site.url,
                sslCert[0].validTo || new Date(),
                sslCert[0].daysUntilExpiry || 0
              );
            }
          }
        }
      }
    }

    return NextResponse.json({
      checked: results.length,
      alertsCreated: alertsToCreate.length,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('SSL cron error:', error);
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 });
  }
}
