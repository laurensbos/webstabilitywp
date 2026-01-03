import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, users } from '@/lib/db';
import { eq } from 'drizzle-orm';

// GET - Get current user's profile and preferences
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id));

    if (!user) {
      return NextResponse.json({ error: 'Gebruiker niet gevonden' }, { status: 404 });
    }

    return NextResponse.json({
      profile: {
        id: user.id,
        name: user.name,
        email: user.email,
        alertEmail: user.alertEmail,
        plan: user.plan,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      },
      notifications: {
        downtime: user.notifyDowntime ?? true,
        recovery: user.notifyRecovery ?? true,
        sslExpiry: user.notifySslExpiry ?? true,
        weeklyReport: user.notifyWeeklyReport ?? true,
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// PATCH - Update user profile or notification preferences
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, alertEmail, notifications } = body;

    // Build update object
    const updates: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    // Profile updates
    if (name !== undefined) {
      updates.name = name;
    }
    if (alertEmail !== undefined) {
      updates.alertEmail = alertEmail || null;
    }

    // Notification preference updates
    if (notifications) {
      if (notifications.downtime !== undefined) {
        updates.notifyDowntime = notifications.downtime;
      }
      if (notifications.recovery !== undefined) {
        updates.notifyRecovery = notifications.recovery;
      }
      if (notifications.sslExpiry !== undefined) {
        updates.notifySslExpiry = notifications.sslExpiry;
      }
      if (notifications.weeklyReport !== undefined) {
        updates.notifyWeeklyReport = notifications.weeklyReport;
      }
    }

    // Update user
    const [updatedUser] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, session.user.id))
      .returning();

    return NextResponse.json({
      success: true,
      profile: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        alertEmail: updatedUser.alertEmail,
        plan: updatedUser.plan,
      },
      notifications: {
        downtime: updatedUser.notifyDowntime ?? true,
        recovery: updatedUser.notifyRecovery ?? true,
        sslExpiry: updatedUser.notifySslExpiry ?? true,
        weeklyReport: updatedUser.notifyWeeklyReport ?? true,
      }
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
