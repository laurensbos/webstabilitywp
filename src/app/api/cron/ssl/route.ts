import { NextRequest, NextResponse } from 'next/server'
import { redis, getSites, updateSite } from '@/lib/redis'
import { sendSSLExpiryWarning } from '@/lib/email'
import https from 'https'

// Get SSL certificate info
async function getSSLInfo(url: string): Promise<{ 
  valid: boolean
  expiryDate?: Date
  daysUntilExpiry?: number
  issuer?: string
  error?: string 
}> {
  return new Promise((resolve) => {
    try {
      const urlObj = new URL(url)
      if (urlObj.protocol !== 'https:') {
        resolve({ valid: false, error: 'Not HTTPS' })
        return
      }
      
      const options = {
        hostname: urlObj.hostname,
        port: 443,
        method: 'HEAD',
        timeout: 10000,
        rejectUnauthorized: false, // Allow checking expired certs
      }
      
      const req = https.request(options, (res) => {
        const cert = (res.socket as any).getPeerCertificate()
        
        if (!cert || Object.keys(cert).length === 0) {
          resolve({ valid: false, error: 'No certificate' })
          return
        }
        
        const expiryDate = new Date(cert.valid_to)
        const now = new Date()
        const daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        
        resolve({
          valid: daysUntilExpiry > 0,
          expiryDate,
          daysUntilExpiry,
          issuer: cert.issuer?.O || cert.issuer?.CN || 'Unknown',
        })
      })
      
      req.on('error', (error) => {
        resolve({ valid: false, error: error.message })
      })
      
      req.on('timeout', () => {
        req.destroy()
        resolve({ valid: false, error: 'Timeout' })
      })
      
      req.end()
    } catch (error) {
      resolve({ valid: false, error: error instanceof Error ? error.message : 'Unknown error' })
    }
  })
}

// Get user email for a site
async function getUserEmailForSite(siteId: string): Promise<string | null> {
  const site = await redis.hgetall(`site:${siteId}`)
  if (!site || !site.userId || site.userId === 'anonymous') return null
  
  const user = await redis.hgetall(`user:${site.userId}`)
  if (!user || !user.email) return null
  
  const settings = await redis.hgetall(`settings:${site.userId}`)
  if (settings && settings.sslAlertsEnabled === 'false') return null
  
  return user.email as string
}

// GET /api/cron/ssl - Check SSL certificates daily
export async function GET(request: NextRequest) {
  // Verify cron
  const vercelCron = request.headers.get('x-vercel-cron')
  const authHeader = request.headers.get('authorization')
  
  if (process.env.NODE_ENV === 'production') {
    if (vercelCron !== '1' && vercelCron !== 'true' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }
  
  try {
    const sites = await getSites()
    
    if (!sites.length) {
      return NextResponse.json({ message: 'No sites to check', checked: 0 })
    }
    
    const results: { siteId: string; ssl: any; alerted: boolean }[] = []
    const WARNING_DAYS = [30, 14, 7, 3, 1] // Days before expiry to warn
    
    for (const site of sites) {
      if (!site.url.startsWith('https://')) {
        continue
      }
      
      const sslInfo = await getSSLInfo(site.url)
      
      // Update site with SSL info
      if (sslInfo.expiryDate) {
        await updateSite(site.id, { 
          sslExpiry: sslInfo.expiryDate.toISOString(),
          sslValid: sslInfo.valid ? 'true' : 'false',
        })
      }
      
      let alerted = false
      
      // Send warning if expiring soon
      if (sslInfo.daysUntilExpiry !== undefined && WARNING_DAYS.includes(sslInfo.daysUntilExpiry)) {
        const userEmail = await getUserEmailForSite(site.id)
        if (userEmail && sslInfo.expiryDate) {
          await sendSSLExpiryWarning({
            to: userEmail,
            siteName: site.name,
            siteUrl: site.url,
            expiryDate: sslInfo.expiryDate,
            daysUntilExpiry: sslInfo.daysUntilExpiry,
          })
          
          // Log alert
          await redis.lpush(`alerts:${site.id}`, JSON.stringify({
            type: 'ssl_warning',
            timestamp: Date.now(),
            daysUntilExpiry: sslInfo.daysUntilExpiry,
            emailSent: userEmail,
          }))
          
          alerted = true
        }
      }
      
      results.push({ siteId: site.id, ssl: sslInfo, alerted })
    }
    
    return NextResponse.json({
      success: true,
      checked: results.length,
      timestamp: new Date().toISOString(),
      results,
    })
  } catch (error) {
    console.error('SSL check failed:', error)
    return NextResponse.json({ error: 'SSL check failed' }, { status: 500 })
  }
}
