import { NextRequest, NextResponse } from 'next/server'
import { getSites, createSite, deleteSite } from '@/lib/redis'

// GET /api/sites - Get all sites
export async function GET() {
  try {
    const sites = await getSites()
    return NextResponse.json({ sites })
  } catch (error) {
    console.error('Failed to get sites:', error)
    return NextResponse.json({ error: 'Failed to get sites' }, { status: 500 })
  }
}

// POST /api/sites - Create a new site
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, name } = body
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }
    
    const site = await createSite(url, name || new URL(url.startsWith('http') ? url : `https://${url}`).hostname)
    return NextResponse.json({ site }, { status: 201 })
  } catch (error) {
    console.error('Failed to create site:', error)
    return NextResponse.json({ error: 'Failed to create site' }, { status: 500 })
  }
}

// DELETE /api/sites?id=xxx - Delete a site
export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Site ID is required' }, { status: 400 })
    }
    
    await deleteSite(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete site:', error)
    return NextResponse.json({ error: 'Failed to delete site' }, { status: 500 })
  }
}
