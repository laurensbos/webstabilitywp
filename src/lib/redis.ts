import { Redis } from '@upstash/redis'

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export interface Site {
  id: string
  url: string
  name: string
  createdAt: number
  lastCheck?: number
  status?: 'up' | 'down' | 'unknown'
  uptime?: number
  responseTime?: number
  performanceScore?: number
  sslExpiry?: string
}

export interface CheckResult {
  siteId: string
  timestamp: number
  status: 'up' | 'down'
  responseTime: number
  statusCode?: number
  error?: string
}

// Site operations
export async function getSites(): Promise<Site[]> {
  const siteIds = await redis.smembers('sites')
  if (!siteIds.length) return []
  
  const sites = await Promise.all(
    siteIds.map(id => redis.hgetall(`site:${id}`))
  )
  
  return sites.filter((site): site is Record<string, unknown> => site !== null).map(site => ({
    id: site.id as string,
    url: site.url as string,
    name: site.name as string,
    createdAt: site.createdAt as number,
    lastCheck: site.lastCheck as number | undefined,
    status: site.status as 'up' | 'down' | 'unknown' | undefined,
    uptime: site.uptime as number | undefined,
    responseTime: site.responseTime as number | undefined,
    performanceScore: site.performanceScore as number | undefined,
    sslExpiry: site.sslExpiry as string | undefined,
  }))
}

export async function getSite(id: string): Promise<Site | null> {
  const site = await redis.hgetall(`site:${id}`)
  if (!site) return null
  return {
    id: site.id as string,
    url: site.url as string,
    name: site.name as string,
    createdAt: site.createdAt as number,
    lastCheck: site.lastCheck as number | undefined,
    status: site.status as 'up' | 'down' | 'unknown' | undefined,
    uptime: site.uptime as number | undefined,
    responseTime: site.responseTime as number | undefined,
    performanceScore: site.performanceScore as number | undefined,
    sslExpiry: site.sslExpiry as string | undefined,
  }
}

export async function createSite(url: string, name: string): Promise<Site> {
  const id = crypto.randomUUID()
  const site: Site = {
    id,
    url: url.startsWith('http') ? url : `https://${url}`,
    name,
    createdAt: Date.now(),
    status: 'unknown',
  }
  
  const siteData: Record<string, string | number> = {
    id: site.id,
    url: site.url,
    name: site.name,
    createdAt: site.createdAt,
    status: site.status || 'unknown',
  }
  
  await redis.hset(`site:${id}`, siteData)
  await redis.sadd('sites', id)
  
  return site
}

export async function deleteSite(id: string): Promise<void> {
  await redis.del(`site:${id}`)
  await redis.srem('sites', id)
  await redis.del(`checks:${id}`)
}

export async function updateSite(id: string, data: Partial<Site>): Promise<void> {
  const updateData: Record<string, string | number> = {}
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      updateData[key] = value as string | number
    }
  }
  await redis.hset(`site:${id}`, updateData)
}

// Check operations
export async function saveCheck(result: CheckResult): Promise<void> {
  // Save latest check to site
  await redis.hset(`site:${result.siteId}`, {
    lastCheck: result.timestamp,
    status: result.status,
    responseTime: result.responseTime,
  })
  
  // Keep last 100 checks for history
  await redis.lpush(`checks:${result.siteId}`, JSON.stringify(result))
  await redis.ltrim(`checks:${result.siteId}`, 0, 99)
}

export async function getChecks(siteId: string, limit = 20): Promise<CheckResult[]> {
  const checks = await redis.lrange(`checks:${siteId}`, 0, limit - 1)
  return checks.map(c => typeof c === 'string' ? JSON.parse(c) : c)
}

// Calculate uptime percentage from last N checks
export async function calculateUptime(siteId: string): Promise<number> {
  const checks = await getChecks(siteId, 100)
  if (!checks.length) return 0
  
  const upCount = checks.filter(c => c.status === 'up').length
  return Math.round((upCount / checks.length) * 1000) / 10
}
