import { NextRequest, NextResponse } from 'next/server';
import { db, sites, incidents } from '@/lib/db';
import { eq, desc, and, gte } from 'drizzle-orm';

// This endpoint allows bureau clients to fetch their monitoring data
// The client sends their email (from Supabase session) and we return their sites

export async function GET(request: NextRequest) {
  try {
    // Get client email from query params or header
    const email = request.nextUrl.searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter required' },
        { status: 400 }
      );
    }

    // Fetch sites linked to this client email
    const clientSites = await db
      .select({
        id: sites.id,
        name: sites.name,
        url: sites.url,
        status: sites.currentStatus,
        uptime: sites.uptimePercentage,
        responseTime: sites.avgResponseTime,
        lastCheckedAt: sites.lastCheckedAt,
        isActive: sites.isActive,
      })
      .from(sites)
      .where(eq(sites.clientEmail, email.toLowerCase()));

    // Format for frontend
    const formattedSites = clientSites.map(site => ({
      id: site.id,
      name: site.name,
      url: site.url,
      status: site.status === 'up' ? 'up' : site.status === 'down' ? 'down' : 'unknown',
      uptime: parseFloat(site.uptime?.toString() || '99.9'),
      responseTime: site.responseTime || 0,
      lastCheckedAt: site.lastCheckedAt?.toISOString() || new Date().toISOString(),
      sslValid: true, // TODO: Add SSL check field to sites
      sslExpiry: undefined,
    }));

    // Fetch recent incidents for these sites
    const siteIds = clientSites.map(s => s.id);
    let clientIncidents: any[] = [];
    
    if (siteIds.length > 0) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const incidentData = await db
        .select()
        .from(incidents)
        .where(
          and(
            gte(incidents.startedAt, thirtyDaysAgo)
          )
        )
        .orderBy(desc(incidents.startedAt))
        .limit(10);
      
      // Filter to only this client's sites
      clientIncidents = incidentData
        .filter(inc => siteIds.includes(inc.siteId))
        .map(inc => {
          const site = clientSites.find(s => s.id === inc.siteId);
          return {
            id: inc.id,
            siteId: inc.siteId,
            siteName: site?.name || 'Onbekend',
            status: inc.status,
            cause: inc.cause,
            startedAt: inc.startedAt?.toISOString(),
            resolvedAt: inc.resolvedAt?.toISOString(),
          };
        });
    }

    // CORS headers
    const response = NextResponse.json({
      sites: formattedSites,
      incidents: clientIncidents
    });
    
    const origin = request.headers.get('origin') || '';
    const allowedOrigins = [
      'https://webstability.nl',
      'https://www.webstability.nl',
      'http://localhost:5173',
      'http://localhost:3000',
    ];
    
    if (allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return response;
  } catch (error) {
    console.error('Error fetching client sites:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 204 });
  const origin = request.headers.get('origin') || '';
  const allowedOrigins = [
    'https://webstability.nl',
    'https://www.webstability.nl',
    'http://localhost:5173',
    'http://localhost:3000',
  ];
  
  if (allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Max-Age', '86400');
  return response;
}
