import { NextRequest, NextResponse } from 'next/server';
import { db, users, sites, uptimeChecks, alerts } from '@/lib/db';
import { eq, and, gte, desc, sql } from 'drizzle-orm';
import { sendWeeklyReportEmail } from '@/lib/email';

// This endpoint is called by Vercel Cron every week (e.g., Monday 9:00 AM)
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get all users with at least one site
    const allUsers = await db.select().from(users);
    
    let emailsSent = 0;
    let errors = 0;

    for (const user of allUsers) {
      try {
        // Check if user wants weekly reports
        if (user.notifyWeeklyReport === false) {
          continue;
        }

        // Get user's sites
        const userSites = await db
          .select()
          .from(sites)
          .where(eq(sites.userId, user.id));

        if (userSites.length === 0) continue;

        // Calculate stats for each site
        const siteStats = await Promise.all(
          userSites.map(async (site) => {
            // Get checks from last week
            const weekChecks = await db
              .select()
              .from(uptimeChecks)
              .where(and(
                eq(uptimeChecks.siteId, site.id),
                gte(uptimeChecks.checkedAt, weekAgo)
              ));

            const totalChecks = weekChecks.length;
            const upChecks = weekChecks.filter(c => c.isUp).length;
            const uptime = totalChecks > 0 ? (upChecks / totalChecks) * 100 : 100;

            const responseTimes = weekChecks
              .filter(c => c.responseTime)
              .map(c => c.responseTime!);
            const avgResponseTime = responseTimes.length > 0
              ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
              : 0;

            // Count incidents (transitions from up to down)
            let incidents = 0;
            for (let i = 1; i < weekChecks.length; i++) {
              if (weekChecks[i - 1].isUp && !weekChecks[i].isUp) {
                incidents++;
              }
            }

            return {
              name: site.name,
              url: site.url,
              uptime: uptime.toFixed(2),
              avgResponseTime,
              incidents,
              status: site.currentStatus as 'up' | 'down' | 'degraded'
            };
          })
        );

        // Get alerts from last week
        const weekAlerts = await db
          .select()
          .from(alerts)
          .where(and(
            eq(alerts.userId, user.id),
            gte(alerts.createdAt, weekAgo)
          ))
          .orderBy(desc(alerts.createdAt));

        // Calculate overall stats
        const totalSites = siteStats.length;
        const avgUptime = siteStats.reduce((acc, s) => acc + parseFloat(s.uptime), 0) / totalSites;
        const totalIncidents = siteStats.reduce((acc, s) => acc + s.incidents, 0);

        // Format period string
        const periodStart = weekAgo.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
        const periodEnd = now.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' });

        // Send weekly report email
        await sendWeeklyReportEmail(
          user.alertEmail || user.email,
          user.name || 'Gebruiker',
          {
            period: `${periodStart} - ${periodEnd}`,
            totalSites,
            avgUptime: avgUptime.toFixed(2),
            totalIncidents,
            totalAlerts: weekAlerts.length,
            sites: siteStats.slice(0, 10), // Top 10 sites
            dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
          }
        );

        emailsSent++;
      } catch (error) {
        console.error(`Error sending weekly report to ${user.email}:`, error);
        errors++;
      }
    }

    return NextResponse.json({
      success: true,
      emailsSent,
      errors,
      timestamp: now.toISOString()
    });
  } catch (error) {
    console.error('Weekly report cron error:', error);
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 });
  }
}
