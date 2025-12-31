import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    // Get user ID from token
    const userId = await redis.get(`verify:${token}`)
    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      )
    }

    // Update user as verified
    await redis.hset(`user:${userId}`, { emailVerified: 'true' })
    
    // Delete verification token
    await redis.del(`verify:${token}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    )
  }
}
