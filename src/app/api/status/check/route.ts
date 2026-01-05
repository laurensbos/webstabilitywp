import { NextRequest, NextResponse } from 'next/server';
import https from 'https';

interface CheckResult {
  url: string;
  status: 'online' | 'offline' | 'slow';
  responseTime: number;
  sslValid: boolean;
  sslExpiry?: string;
  statusCode: number;
}

// Rate limiting: simple in-memory store (resets on deploy)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10; // requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return false;
  }
  
  if (record.count >= RATE_LIMIT) {
    return true;
  }
  
  record.count++;
  return false;
}

function checkSSL(hostname: string): Promise<{ valid: boolean; expiry?: string }> {
  return new Promise((resolve) => {
    try {
      const options = {
        hostname,
        port: 443,
        method: 'HEAD',
        timeout: 10000,
        rejectUnauthorized: true,
      };

      const req = https.request(options, (res) => {
        const socket = res.socket as import('tls').TLSSocket;
        const cert = socket.getPeerCertificate();
        
        if (cert && cert.valid_to) {
          resolve({
            valid: true,
            expiry: cert.valid_to,
          });
        } else {
          resolve({ valid: true });
        }
      });

      req.on('error', () => {
        resolve({ valid: false });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({ valid: false });
      });

      req.end();
    } catch {
      resolve({ valid: false });
    }
  });
}

async function performCheck(url: string): Promise<{ isUp: boolean; statusCode: number; responseTime: number; error?: string }> {
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
    
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'WebStability Check/1.0',
      },
      redirect: 'follow',
    });
    
    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;
    
    return {
      isUp: response.status >= 200 && response.status < 400,
      statusCode: response.status,
      responseTime,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    // Try GET request as fallback (some servers block HEAD)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'WebStability Check/1.0',
        },
        redirect: 'follow',
      });
      
      clearTimeout(timeoutId);
      const getResponseTime = Date.now() - startTime;
      
      return {
        isUp: response.status >= 200 && response.status < 400,
        statusCode: response.status,
        responseTime: getResponseTime,
      };
    } catch {
      return {
        isUp: false,
        statusCode: 0,
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor?.split(',')[0]?.trim() || 'unknown';
    
    // Check rate limit
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Te veel verzoeken. Probeer het over een minuut opnieuw.' },
        { status: 429 }
      );
    }
    
    const body = await request.json();
    const { url } = body;
    
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is verplicht' },
        { status: 400 }
      );
    }
    
    // Validate and normalize URL
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }
    
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(normalizedUrl);
    } catch {
      return NextResponse.json(
        { error: 'Ongeldige URL' },
        { status: 400 }
      );
    }
    
    // Only allow http(s) protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return NextResponse.json(
        { error: 'Alleen HTTP en HTTPS URLs zijn toegestaan' },
        { status: 400 }
      );
    }
    
    // Perform uptime check
    const uptimeResult = await performCheck(normalizedUrl);
    
    // Check SSL if HTTPS
    let sslResult: { valid: boolean; expiry?: string } = { valid: false };
    if (parsedUrl.protocol === 'https:') {
      sslResult = await checkSSL(parsedUrl.hostname);
    }
    
    // Determine status
    let status: 'online' | 'offline' | 'slow' = 'offline';
    if (uptimeResult.isUp) {
      status = uptimeResult.responseTime > 1500 ? 'slow' : 'online';
    }
    
    const result: CheckResult = {
      url: normalizedUrl,
      status,
      responseTime: uptimeResult.responseTime,
      sslValid: sslResult.valid,
      sslExpiry: sslResult.expiry,
      statusCode: uptimeResult.statusCode,
    };
    
    // CORS headers for cross-origin requests from bureau website
    const response = NextResponse.json(result);
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
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    
    return response;
  } catch (error) {
    console.error('Error in status check:', error);
    return NextResponse.json(
      { error: 'Er ging iets mis bij het controleren' },
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
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  response.headers.set('Access-Control-Max-Age', '86400');
  return response;
}
