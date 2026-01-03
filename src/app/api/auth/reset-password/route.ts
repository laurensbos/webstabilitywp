import { NextRequest, NextResponse } from 'next/server';
import { db, users } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { sendPasswordResetEmail } from '@/lib/email';
import { createResetToken, verifyResetToken } from '@/lib/auth/tokens';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'E-mailadres is verplicht' }, { status: 400 });
    }

    // Find user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ 
        success: true,
        message: 'Als dit e-mailadres bekend is, ontvang je een reset link.'
      });
    }

    // Generate reset token
    const token = createResetToken(user.email);

    // Send email
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
    await sendPasswordResetEmail(user.email, user.name || 'Gebruiker', resetUrl);

    return NextResponse.json({ 
      success: true,
      message: 'Als dit e-mailadres bekend is, ontvang je een reset link.'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// Verify token
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token is verplicht' }, { status: 400 });
    }

    const result = verifyResetToken(token);

    if (!result.valid) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ valid: true, email: result.email });
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
