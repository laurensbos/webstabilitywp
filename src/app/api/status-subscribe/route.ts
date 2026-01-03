import { NextRequest, NextResponse } from 'next/server';
import { db, statusSubscribers, users } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { randomBytes } from 'crypto';

// POST /api/status-subscribe - Subscribe to status updates
export async function POST(request: NextRequest) {
  try {
    const { email, slug } = await request.json();

    if (!email || !slug) {
      return NextResponse.json({ error: 'Email and slug are required' }, { status: 400 });
    }

    // Find user by status page slug
    const allUsers = await db.select().from(users);
    const user = allUsers.find(u => {
      const userSlug = (u.name || u.email.split('@')[0])
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      return userSlug === slug;
    });

    if (!user) {
      return NextResponse.json({ error: 'Status page not found' }, { status: 404 });
    }

    // Check if already subscribed
    const [existing] = await db
      .select()
      .from(statusSubscribers)
      .where(and(
        eq(statusSubscribers.userId, user.id),
        eq(statusSubscribers.email, email.toLowerCase())
      ));

    if (existing) {
      if (existing.unsubscribedAt) {
        // Re-subscribe
        await db
          .update(statusSubscribers)
          .set({ unsubscribedAt: null, subscribedAt: new Date() })
          .where(eq(statusSubscribers.id, existing.id));
        return NextResponse.json({ success: true, message: 'Re-subscribed successfully' });
      }
      return NextResponse.json({ error: 'Already subscribed' }, { status: 400 });
    }

    // Create verification token
    const verificationToken = randomBytes(32).toString('hex');

    // Create subscriber
    await db.insert(statusSubscribers).values({
      userId: user.id,
      email: email.toLowerCase(),
      verificationToken,
      isVerified: false,
    });

    // TODO: Send verification email
    // For now, auto-verify (in production, send email)
    await db
      .update(statusSubscribers)
      .set({ isVerified: true })
      .where(eq(statusSubscribers.email, email.toLowerCase()));

    return NextResponse.json({ 
      success: true, 
      message: 'Subscribed successfully! You will receive updates when there are incidents.' 
    });
  } catch (error) {
    console.error('Error subscribing:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// DELETE /api/status-subscribe - Unsubscribe from status updates
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token && !email) {
      return NextResponse.json({ error: 'Token or email required' }, { status: 400 });
    }

    if (token) {
      await db
        .update(statusSubscribers)
        .set({ unsubscribedAt: new Date() })
        .where(eq(statusSubscribers.verificationToken, token));
    } else if (email) {
      await db
        .update(statusSubscribers)
        .set({ unsubscribedAt: new Date() })
        .where(eq(statusSubscribers.email, email.toLowerCase()));
    }

    return NextResponse.json({ success: true, message: 'Unsubscribed successfully' });
  } catch (error) {
    console.error('Error unsubscribing:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
