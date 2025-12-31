import { db, uptimeChecks, sites, alerts } from '@/lib/db';
import { eq, desc, and, gte, sql } from 'drizzle-orm';
import { sendDowntimeAlert } from '@/lib/email';

interface UptimeCheckResult {
  isUp: boolean;
  status: number | null;
  responseTime: number;
  error?: string;
}

export async function checkUptime(url: string): Promise<UptimeCheckResult> {
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
    
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'WebStability Monitor/1.0',
      },
    });
    
    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;
    
    const isUp = response.status >= 200 && response.status < 400;
    
    return {
      isUp,
      status: response.status,
      responseTime,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      isUp: false,
      status: null,
      responseTime,
      error: errorMessage,
    };
  }
}

export async function performUptimeCheck(siteId: string) {
  // Get site details
  const [site] = await db.select().from(sites).where(eq(sites.id, siteId));
  if (!site || !site.isActive) return null;
  
  // Perform the check
  const result = await checkUptime(site.url);
  
  // Store the result
  const [check] = await db.insert(uptimeChecks).values({
    siteId,
    status: result.status,
    responseTime: result.responseTime,
    isUp: result.isUp,
    error: result.error,
  }).returning();
  
  // Get previous status to detect state change
  const previousChecks = await db
    .select()
    .from(uptimeChecks)
    .where(eq(uptimeChecks.siteId, siteId))
    .orderBy(desc(uptimeChecks.checkedAt))
    .limit(2);
  
  const previousCheck = previousChecks[1]; // Second most recent
  const statusChanged = previousCheck && previousCheck.isUp !== result.isUp;
  
  // Update site status
  await db.update(sites).set({
    currentStatus: result.isUp ? 'up' : 'down',
    lastCheckedAt: new Date(),
    updatedAt: new Date(),
  }).where(eq(sites.id, siteId));
  
  // Create alert if status changed
  if (statusChanged) {
    await db.insert(alerts).values({
      siteId,
      userId: site.userId,
      type: result.isUp ? 'recovery' : 'downtime',
      title: result.isUp ? `${site.name} is weer online` : `${site.name} is offline`,
      message: result.isUp 
        ? `Je website is hersteld en weer bereikbaar.`
        : `Je website is niet bereikbaar.${result.error ? ` Fout: ${result.error}` : ''}`,
      severity: result.isUp ? 'info' : 'critical',
    });
    
    // Send email notification
    const [user] = await db.query.users.findMany({
      where: (users, { eq }) => eq(users.id, site.userId),
    });
    
    if (user?.email) {
      await sendDowntimeAlert(
        user.alertEmail || user.email,
        site.name,
        site.url,
        !result.isUp,
        result.error
      );
    }
  }
  
  return check;
}

export async function getUptimeStats(siteId: string, days: number = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  
  const checks = await db
    .select()
    .from(uptimeChecks)
    .where(
      and(
        eq(uptimeChecks.siteId, siteId),
        gte(uptimeChecks.checkedAt, since)
      )
    )
    .orderBy(desc(uptimeChecks.checkedAt));
  
  if (checks.length === 0) {
    return {
      uptimePercentage: 100,
      totalChecks: 0,
      upChecks: 0,
      downChecks: 0,
      avgResponseTime: 0,
      checks: [],
    };
  }
  
  const upChecks = checks.filter(c => c.isUp).length;
  const uptimePercentage = (upChecks / checks.length) * 100;
  const avgResponseTime = checks.reduce((sum, c) => sum + (c.responseTime || 0), 0) / checks.length;
  
  return {
    uptimePercentage: Math.round(uptimePercentage * 100) / 100,
    totalChecks: checks.length,
    upChecks,
    downChecks: checks.length - upChecks,
    avgResponseTime: Math.round(avgResponseTime),
    checks: checks.slice(0, 100), // Last 100 checks for chart
  };
}

export async function getRecentDowntime(siteId: string) {
  const checks = await db
    .select()
    .from(uptimeChecks)
    .where(
      and(
        eq(uptimeChecks.siteId, siteId),
        eq(uptimeChecks.isUp, false)
      )
    )
    .orderBy(desc(uptimeChecks.checkedAt))
    .limit(10);
  
  return checks;
}
