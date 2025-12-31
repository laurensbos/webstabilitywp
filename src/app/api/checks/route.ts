import { NextRequest, NextResponse } from 'next/server'
import { getChecks } from '@/lib/redis'

// GET /api/checks?siteId=xxx - Get check history for a site
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get('siteId')
    const limit = parseInt(searchParams.get('limit') || '30')
    
    if (!siteId) {
      return NextResponse.json({ error: 'siteId is required' }, { status: 400 })
    }
    
    const checks = await getChecks(siteId, limit)
    
    return NextResponse.json({ checks })
  } catch (error) {
    console.error('Failed to get checks:', error)
    return NextResponse.json({ error: 'Failed to get checks' }, { status: 500 })
  }
}
