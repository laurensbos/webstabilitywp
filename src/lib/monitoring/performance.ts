import { db, performanceMetrics, sites } from '@/lib/db';
import { eq, desc } from 'drizzle-orm';

interface PerformanceResult {
  performanceScore: number;
  accessibilityScore: number;
  bestPracticesScore: number;
  seoScore: number;
  lcp: number;
  fid: number;
  cls: number;
  ttfb: number;
}

export async function checkPerformance(url: string): Promise<PerformanceResult | null> {
  try {
    // Use Google PageSpeed Insights API
    const apiKey = process.env.PAGESPEED_API_KEY;
    const encodedUrl = encodeURIComponent(url);
    
    const apiUrl = apiKey 
      ? `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodedUrl}&key=${apiKey}&strategy=mobile&category=performance&category=accessibility&category=best-practices&category=seo`
      : `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodedUrl}&strategy=mobile&category=performance&category=accessibility&category=best-practices&category=seo`;
    
    const response = await fetch(apiUrl, {
      signal: AbortSignal.timeout(60000), // 60 second timeout
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData?.error?.message || `HTTP ${response.status}`;
      
      // Check for rate limiting
      if (response.status === 429 || errorData?.error?.status === 'RESOURCE_EXHAUSTED') {
        console.error('PageSpeed API rate limited. Consider adding PAGESPEED_API_KEY to .env.local');
        console.error('Get a free API key at: https://developers.google.com/speed/docs/insights/v5/get-started');
      } else {
        console.error('PageSpeed API error:', errorMessage);
      }
      return null;
    }
    
    const data = await response.json();
    const lighthouse = data.lighthouseResult;
    
    if (!lighthouse) return null;
    
    const categories = lighthouse.categories;
    const audits = lighthouse.audits;
    
    return {
      performanceScore: Math.round((categories.performance?.score || 0) * 100),
      accessibilityScore: Math.round((categories.accessibility?.score || 0) * 100),
      bestPracticesScore: Math.round((categories['best-practices']?.score || 0) * 100),
      seoScore: Math.round((categories.seo?.score || 0) * 100),
      lcp: audits['largest-contentful-paint']?.numericValue || 0,
      fid: audits['max-potential-fid']?.numericValue || 0,
      cls: audits['cumulative-layout-shift']?.numericValue || 0,
      ttfb: audits['server-response-time']?.numericValue || 0,
    };
  } catch (error) {
    console.error('Performance check failed:', error);
    return null;
  }
}

export async function performPerformanceCheck(siteId: string) {
  const [site] = await db.select().from(sites).where(eq(sites.id, siteId));
  if (!site) return null;
  
  const result = await checkPerformance(site.url);
  if (!result) return null;
  
  const [metric] = await db.insert(performanceMetrics).values({
    siteId,
    performanceScore: result.performanceScore,
    accessibilityScore: result.accessibilityScore,
    bestPracticesScore: result.bestPracticesScore,
    seoScore: result.seoScore,
    lcp: result.lcp.toString(),
    fid: result.fid.toString(),
    cls: result.cls.toString(),
    ttfb: result.ttfb.toString(),
  }).returning();
  
  return metric;
}

export async function getLatestPerformance(siteId: string) {
  const [metric] = await db
    .select()
    .from(performanceMetrics)
    .where(eq(performanceMetrics.siteId, siteId))
    .orderBy(desc(performanceMetrics.createdAt))
    .limit(1);
  
  return metric || null;
}

export async function getPerformanceHistory(siteId: string, limit: number = 30) {
  const metrics = await db
    .select()
    .from(performanceMetrics)
    .where(eq(performanceMetrics.siteId, siteId))
    .orderBy(desc(performanceMetrics.createdAt))
    .limit(limit);
  
  return metrics;
}

export function getScoreColor(score: number): string {
  if (score >= 90) return '#6366f1'; // green
  if (score >= 50) return '#f59e0b'; // yellow
  return '#ef4444'; // red
}

export function getScoreLabel(score: number): string {
  if (score >= 90) return 'Goed';
  if (score >= 50) return 'Matig';
  return 'Slecht';
}
