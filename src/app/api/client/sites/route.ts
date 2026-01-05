import { NextRequest, NextResponse } from 'next/server';
import { db, sites, uptimeChecks, incidents } from '@/lib/db';
import { eq, desc, and, gte } from 'drizzle-orm';

// This endpoint allows bureau clients to fetch their monitoring data
// Authentication is via a client token (to be implemented with Supabase integration)

export async function GET(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    // TODO: Validate token against Supabase
    // For now, we'll use a simple token validation
    // In production, this should verify against Supabase and get the user's email
    
    // For demo purposes, return demo data
    // In production, you'd query the database for sites linked to this client
    
    const demoSites = [
      {
        id: 'demo-1',
        name: 'Mijn Website',
        url: 'https://mijnwebsite.nl',
        status: 'up',
        uptime: 99.98,
        responseTime: 245,
        lastCheckedAt: new Date().toISOString(),
        sslValid: true,
        sslExpiry: '2026-06-15'
      },
      {
        id: 'demo-2',
        name: 'Webshop',
        url: 'https://shop.mijnwebsite.nl',
        status: 'up',
        uptime: 99.95,
        responseTime: 312,
        lastCheckedAt: new Date().toISOString(),
        sslValid: true,
        sslExpiry: '2026-06-15'
      }
    ];

    const demoIncidents: any[] = [];

    // CORS headers
    const response = NextResponse.json({
      sites: demoSites,
      incidents: demoIncidents
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
