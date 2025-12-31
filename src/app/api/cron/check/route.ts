import { NextRequest, NextResponse } from 'next/server'
import { redis, getSites, saveCheck, updateSite, calculateUptime, CheckResult } from '@/lib/redis'
import { sendDowntimeAlert } from '@/lib/email'

// Verify cron secret (Vercel sends this header)
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  if (authHeader === `Bearer ${process.env.CRON_SECRET}`) {
    return true
  }
  // Also allow from Vercel's cron
  const vercelCron = request.headers.get('x-vercel-cron')
  return vercelCron === '1' || vercelCron === 'true'
}

// Check a single site
async function checkSite(url: string): Promise<{ 
  status: 'up' | 'down'
  responseTime: number
  statusCode?: number
  error?: string 
}> {
  const start = Date.now()
  
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)
    
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'WebstabilityBot/1.0 (+https://webstability.nl)',
      },
    })
    
    clearTimeout(timeout)
    const responseTime = Date.now() - start
    
    return {
      status: response.ok ? 'up' : 'down',
      responseTime,
      statusCode: response.status,
    }
  } catch (error) {
    return {
      status: 'down',
      responseTime: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Get user email for a site
async function getUserEmailForSite(siteId: string): Promise<string | null> {
  const site = await redis.hgetall(`site:${siteId}`)
  if (!site || !site.userId || site.userId === 'anonymous') return null
  
  const user = await redis.hgetall(`user:${site.userId}`)
  if (!user || !user.email) return null
  
  // Check if user has alerts enabled
  const settings = await redis.hgetall(`settings:${site.userId}`)
  if (settings && settings.alertsEnabled === 'false') return null
  
  return user.email as string
}

// GET /api/cron/check - Run by Vercel cron every 5 minutes
export async function GET(request: NextRequest) {
  // Verify this is a legitimate cron request
  if (!verifyCronSecret(request)) {
    // In development, allow without auth
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }
  
  try {
    const sites = await getSites()
    
    if (!sites.length) {
      return NextResponse.json({ message: 'No sites to check', checked: 0 })
    }
    
    const results: (CheckResult & { alerted?: boolean })[] = []
    
    // Check all sites
    for (const site of sites) {
      const previousStatus = site.status
      const result = await checkSite(site.url)
      
      const checkResult: CheckResult = {
        siteId: site.id,
        timestamp: Date.now(),
        status: result.status,
        responseTime: result.responseTime,
        statusCode: result.statusCode,
        error: result.error,
      }
      
      // Save check result
      await saveCheck(checkResult)
      
      // Update uptime
      const uptime = await calculateUptime(site.id)
      await updateSite(site.id, { uptime })
      
      let alerted = false
      
      // Send alert if status changed
      if (previousStatus && previousStatus !== result.status) {
        const userEmail = await getUserEmailForSite(site.id)
        if (userEmail) {
          await sendDowntimeAlert({
            to: userEmail,
            siteName: site.name,
            siteUrl: site.url,
            status: result.status,
            error: result.error,
            responseTime: result.responseTime,
            timestamp: checkResult.timestamp,
          })
          
          // Log alert
          await redis.lpush(`alerts:${site.id}`, JSON.stringify({
            type: result.status === 'down' ? 'downtime' : 'recovery',
            timestamp: checkResult.timestamp,
            error: result.error,
            emailSent: userEmail,
          }))
          await redis.ltrim(`alerts:${site.id}`, 0, 99)
          
          alerted = true
        }
      }
      
      results.push({ ...checkResult, alerted })
    }
    
    return NextResponse.json({
      success: true,
      checked: results.length,
      timestamp: new Date().toISOString(),
      results: results.map(r => ({
        siteId: r.siteId,
        status: r.status,
        responseTime: r.responseTime,
        alerted: r.alerted,
      })),
    })
  } catch (error) {
    console.error('Cron check failed:', error)
    return NextResponse.json({ error: 'Check failed' }, { status: 500 })
  }
}
