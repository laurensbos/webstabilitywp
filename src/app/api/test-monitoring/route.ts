import { NextRequest, NextResponse } from 'next/server';
import { checkSSL } from '@/lib/monitoring/ssl';
import { checkUptime } from '@/lib/monitoring/uptime';
import { checkPerformance } from '@/lib/monitoring/performance';

// Test endpoint for monitoring functions - only available in development
export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    const { url, tests } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const results: Record<string, unknown> = {};
    const testsToRun = tests || ['uptime', 'ssl', 'performance'];

    // Extract hostname for SSL check
    let hostname: string;
    try {
      hostname = new URL(url).hostname;
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    // Run uptime check
    if (testsToRun.includes('uptime')) {
      console.log('Testing uptime for:', url);
      const uptimeResult = await checkUptime(url);
      results.uptime = {
        success: uptimeResult.isUp,
        status: uptimeResult.status,
        responseTime: uptimeResult.responseTime,
        error: uptimeResult.error,
      };
    }

    // Run SSL check
    if (testsToRun.includes('ssl')) {
      console.log('Testing SSL for:', hostname);
      const sslResult = await checkSSL(hostname);
      results.ssl = {
        isValid: sslResult.isValid,
        issuer: sslResult.issuer,
        validFrom: sslResult.validFrom,
        validTo: sslResult.validTo,
        daysUntilExpiry: sslResult.daysUntilExpiry,
        error: sslResult.error,
      };
    }

    // Run performance check (SEO included)
    if (testsToRun.includes('performance')) {
      console.log('Testing performance for:', url);
      const perfResult = await checkPerformance(url);
      results.performance = perfResult
        ? {
            performanceScore: perfResult.performanceScore,
            accessibilityScore: perfResult.accessibilityScore,
            bestPracticesScore: perfResult.bestPracticesScore,
            seoScore: perfResult.seoScore,
            lcp: perfResult.lcp,
            fid: perfResult.fid,
            cls: perfResult.cls,
            ttfb: perfResult.ttfb,
          }
        : { 
            error: 'Performance check failed',
            hint: process.env.PAGESPEED_API_KEY 
              ? 'API key is set but check failed - possibly rate limited'
              : 'No PAGESPEED_API_KEY set. Get one free at: https://developers.google.com/speed/docs/insights/v5/get-started'
          };
    }

    return NextResponse.json({
      url,
      hostname,
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (error) {
    console.error('Test monitoring error:', error);
    return NextResponse.json(
      { error: 'Test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
