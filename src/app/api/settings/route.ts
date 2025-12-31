import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { redis } from '@/lib/redis'

interface UserSettings {
  alertsEnabled: boolean
  sslAlertsEnabled: boolean
  emailFrequency: 'instant' | 'hourly' | 'daily'
  timezone: string
}

const DEFAULT_SETTINGS: UserSettings = {
  alertsEnabled: true,
  sslAlertsEnabled: true,
  emailFrequency: 'instant',
  timezone: 'Europe/Amsterdam',
}

// GET /api/settings - Get user settings
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const settings = await redis.hgetall(`settings:${session.user.id}`)
    
    if (!settings || Object.keys(settings).length === 0) {
      return NextResponse.json({ settings: DEFAULT_SETTINGS })
    }
    
    return NextResponse.json({
      settings: {
        alertsEnabled: settings.alertsEnabled !== 'false',
        sslAlertsEnabled: settings.sslAlertsEnabled !== 'false',
        emailFrequency: settings.emailFrequency || 'instant',
        timezone: settings.timezone || 'Europe/Amsterdam',
      }
    })
  } catch (error) {
    console.error('Failed to get settings:', error)
    return NextResponse.json({ error: 'Failed to get settings' }, { status: 500 })
  }
}

// PUT /api/settings - Update user settings
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    
    const settingsData: Record<string, string> = {}
    
    if (typeof body.alertsEnabled === 'boolean') {
      settingsData.alertsEnabled = body.alertsEnabled.toString()
    }
    if (typeof body.sslAlertsEnabled === 'boolean') {
      settingsData.sslAlertsEnabled = body.sslAlertsEnabled.toString()
    }
    if (body.emailFrequency) {
      settingsData.emailFrequency = body.emailFrequency
    }
    if (body.timezone) {
      settingsData.timezone = body.timezone
    }
    
    await redis.hset(`settings:${session.user.id}`, settingsData)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
