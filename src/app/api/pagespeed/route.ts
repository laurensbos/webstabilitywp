import { NextRequest, NextResponse } from 'next/server'
import { updateSite } from '@/lib/redis'

interface PageSpeedResult {
  performanceScore: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  totalBlockingTime: number
  cumulativeLayoutShift: number
  speedIndex: number
}

async function getPageSpeedScore(url: string): Promise<PageSpeedResult | null> {
  try {
    // Google PageSpeed Insights API (gratis, geen key nodig voor basis gebruik)
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile`
    
    const response = await fetch(apiUrl)
    
    if (!response.ok) {
      console.error('PageSpeed API error:', response.status)
      return null
    }
    
    const data = await response.json()
    const lighthouse = data.lighthouseResult
    
    if (!lighthouse) return null
    
    return {
      performanceScore: Math.round((lighthouse.categories?.performance?.score || 0) * 100),
      firstContentfulPaint: lighthouse.audits?.['first-contentful-paint']?.numericValue || 0,
      largestContentfulPaint: lighthouse.audits?.['largest-contentful-paint']?.numericValue || 0,
      totalBlockingTime: lighthouse.audits?.['total-blocking-time']?.numericValue || 0,
      cumulativeLayoutShift: lighthouse.audits?.['cumulative-layout-shift']?.numericValue || 0,
      speedIndex: lighthouse.audits?.['speed-index']?.numericValue || 0,
    }
  } catch (error) {
    console.error('PageSpeed check failed:', error)
    return null
  }
}

// GET /api/pagespeed?url=xxx&siteId=xxx
export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get('url')
    const siteId = request.nextUrl.searchParams.get('siteId')
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }
    
    const result = await getPageSpeedScore(url)
    
    if (!result) {
      return NextResponse.json({ error: 'Failed to get PageSpeed score' }, { status: 500 })
    }
    
    // If siteId provided, save to Redis
    if (siteId) {
      await updateSite(siteId, { performanceScore: result.performanceScore })
    }
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('PageSpeed API error:', error)
    return NextResponse.json({ error: 'PageSpeed check failed' }, { status: 500 })
  }
}
