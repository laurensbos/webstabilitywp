import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { redis } from '@/lib/redis'

interface Alert {
  type: 'downtime' | 'recovery' | 'ssl_warning'
  timestamp: number
  error?: string
  daysUntilExpiry?: number
  emailSent?: string
}

// GET /api/alerts - Get all alerts for user's sites
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get user's sites
    const userSiteIds = await redis.smembers(`user:${session.user.id}:sites`)
    
    if (!userSiteIds.length) {
      return NextResponse.json({ alerts: [] })
    }
    
    // Get alerts for each site
    const allAlerts: (Alert & { siteId: string; siteName: string; siteUrl: string })[] = []
    
    for (const siteId of userSiteIds) {
      const site = await redis.hgetall(`site:${siteId}`)
      if (!site) continue
      
      const alerts = await redis.lrange(`alerts:${siteId}`, 0, 49)
      
      for (const alertStr of alerts) {
        try {
          const alert = typeof alertStr === 'string' ? JSON.parse(alertStr) : alertStr
          allAlerts.push({
            ...alert,
            siteId,
            siteName: site.name as string,
            siteUrl: site.url as string,
          })
        } catch (e) {
          // Skip invalid alerts
        }
      }
    }
    
    // Sort by timestamp descending
    allAlerts.sort((a, b) => b.timestamp - a.timestamp)
    
    return NextResponse.json({ alerts: allAlerts.slice(0, 100) })
  } catch (error) {
    console.error('Failed to get alerts:', error)
    return NextResponse.json({ error: 'Failed to get alerts' }, { status: 500 })
  }
}
