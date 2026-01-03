import { NextRequest, NextResponse } from 'next/server';
import { db, users } from '@/lib/db';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { verifyResetToken, consumeResetToken } from '@/lib/auth/tokens';

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Token en wachtwoord zijn verplicht' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Wachtwoord moet minimaal 8 karakters zijn' }, { status: 400 });
    }

    // Verify the token
    const tokenResult = verifyResetToken(token);

    if (!tokenResult.valid || !tokenResult.email) {
      return NextResponse.json({ error: tokenResult.error || 'Ongeldige of verlopen link' }, { status: 400 });
    }

    // Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, tokenResult.email))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'Gebruiker niet gevonden' }, { status: 404 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update password
    await db
      .update(users)
      .set({ 
        passwordHash: hashedPassword,
        updatedAt: new Date()
      })
      .where(eq(users.id, user.id));

    // Remove used token
    consumeResetToken(token);

    return NextResponse.json({ 
      success: true,
      message: 'Wachtwoord succesvol gewijzigd'
    });
  } catch (error) {
    console.error('Password update error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
