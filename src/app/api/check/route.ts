import { NextResponse } from 'next/server'
import { getSites, saveCheck, updateSite, calculateUptime, CheckResult } from '@/lib/redis'

// Check a single site
async function checkSite(url: string): Promise<{ status: 'up' | 'down'; responseTime: number; statusCode?: number; error?: string }> {
  const start = Date.now()
  
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000) // 10s timeout
    
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

// GET /api/check - Run checks on all sites (called by cron)
export async function GET() {
  try {
    const sites = await getSites()
    
    if (!sites.length) {
      return NextResponse.json({ message: 'No sites to check' })
    }
    
    const results: CheckResult[] = []
    
    // Check all sites in parallel (with limit)
    const checkPromises = sites.map(async (site) => {
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
      
      results.push(checkResult)
    })
    
    await Promise.all(checkPromises)
    
    return NextResponse.json({
      checked: results.length,
      results,
    })
  } catch (error) {
    console.error('Check failed:', error)
    return NextResponse.json({ error: 'Check failed' }, { status: 500 })
  }
}
