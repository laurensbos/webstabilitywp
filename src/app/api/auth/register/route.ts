import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { sendVerificationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password and name are required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await redis.get(`user:email:${email.toLowerCase()}`)
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')

    // Create user
    const userId = crypto.randomUUID()
    const user = {
      id: userId,
      email: email.toLowerCase(),
      name,
      password: hashedPassword,
      createdAt: Date.now(),
      emailVerified: 'false',
      verificationToken,
    }

    // Save user to Redis
    await redis.hset(`user:${userId}`, user)
    await redis.set(`user:email:${email.toLowerCase()}`, userId)
    await redis.set(`verify:${verificationToken}`, userId, { ex: 86400 }) // 24 hours

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken)
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError)
      // Continue anyway - user can request new verification email
    }

    return NextResponse.json({
      success: true,
      message: 'Account created! Please check your email to verify your account.',
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}
