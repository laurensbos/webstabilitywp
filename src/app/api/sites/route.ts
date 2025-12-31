import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { redis } from '@/lib/redis'
import crypto from 'crypto'

interface Site {
  id: string
  url: string
  name: string
  userId: string
  createdAt: number
  lastCheck?: number
  status?: 'up' | 'down' | 'unknown'
  responseTime?: number
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      // For demo/unauthenticated access, return all sites
      const allSiteIds = await redis.smembers('sites')
      if (!allSiteIds.length) return NextResponse.json({ sites: [] })
      
      const sites = await Promise.all(
        allSiteIds.map(async (id) => {
          const site = await redis.hgetall(`site:${id}`)
          if (!site) return null
          return {
            id: site.id as string,
            url: site.url as string,
            name: site.name as string,
            createdAt: site.createdAt as number,
            lastCheck: site.lastCheck as number | undefined,
            status: site.status as string | undefined,
            responseTime: site.responseTime as number | undefined,
          }
        })
      )
      return NextResponse.json({ sites: sites.filter(Boolean) })
    }

    // Get user's sites
    const userSiteIds = await redis.smembers(`user:${session.user.id}:sites`)
    if (!userSiteIds.length) return NextResponse.json({ sites: [] })

    const sites = await Promise.all(
      userSiteIds.map(async (id) => {
        const site = await redis.hgetall(`site:${id}`)
        if (!site) return null
        return {
          id: site.id as string,
          url: site.url as string,
          name: site.name as string,
          createdAt: site.createdAt as number,
          lastCheck: site.lastCheck as number | undefined,
          status: site.status as string | undefined,
          responseTime: site.responseTime as number | undefined,
        }
      })
    )

    return NextResponse.json({ sites: sites.filter(Boolean) })
  } catch (error) {
    console.error('Failed to get sites:', error)
    return NextResponse.json({ error: 'Failed to get sites' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const { url, name } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    const id = crypto.randomUUID()
    const site: Record<string, string | number> = {
      id,
      url: url.startsWith('http') ? url : `https://${url}`,
      name: name || url,
      userId: session?.user?.id || 'anonymous',
      createdAt: Date.now(),
      status: 'unknown',
    }

    await redis.hset(`site:${id}`, site)
    await redis.sadd('sites', id)
    
    if (session?.user?.id) {
      await redis.sadd(`user:${session.user.id}:sites`, id)
    }

    return NextResponse.json({ site })
  } catch (error) {
    console.error('Failed to create site:', error)
    return NextResponse.json({ error: 'Failed to create site' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Site ID is required' }, { status: 400 })
    }

    // Check ownership
    const site = await redis.hgetall(`site:${id}`)
    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 })
    }

    // Allow deletion if anonymous site or user owns it
    if (site.userId !== 'anonymous' && session?.user?.id && site.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await redis.del(`site:${id}`)
    await redis.srem('sites', id)
    
    if (session?.user?.id) {
      await redis.srem(`user:${session.user.id}:sites`, id)
    }
    
    await redis.del(`checks:${id}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete site:', error)
    return NextResponse.json({ error: 'Failed to delete site' }, { status: 500 })
  }
}
