import { NextRequest, NextResponse } from 'next/server';
import { db, users } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { 
  createVerificationToken, 
  verifyEmailToken, 
  consumeVerificationToken,
  getVerificationByUserId 
} from '@/lib/auth/tokens';
import { sendVerificationEmail } from '@/lib/email';

// POST - Verify email with token or code
export async function POST(request: NextRequest) {
  try {
    const { token, code } = await request.json();
    const tokenOrCode = token || code;

    if (!tokenOrCode) {
      return NextResponse.json(
        { error: 'Verificatiecode is verplicht' },
        { status: 400 }
      );
    }

    // Verify the token/code
    const verification = verifyEmailToken(tokenOrCode);
    
    if (!verification.valid) {
      return NextResponse.json(
        { error: verification.error },
        { status: 400 }
      );
    }

    // Update user's email verified status
    const [updatedUser] = await db
      .update(users)
      .set({ 
        emailVerified: true,
        updatedAt: new Date()
      })
      .where(eq(users.id, verification.userId!))
      .returning();

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Gebruiker niet gevonden' },
        { status: 404 }
      );
    }

    // Consume the token
    consumeVerificationToken(tokenOrCode);

    return NextResponse.json({
      success: true,
      message: 'Email succesvol geverifieerd'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Er is iets misgegaan' },
      { status: 500 }
    );
  }
}

// GET - Check verification status or send new verification email
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const userId = searchParams.get('userId');
    const resend = searchParams.get('resend');

    // Verify by token (from email link)
    if (token) {
      const verification = verifyEmailToken(token);
      return NextResponse.json({
        valid: verification.valid,
        error: verification.error
      });
    }

    // Resend verification email
    if (resend && userId) {
      // Get user
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));

      if (!user) {
        return NextResponse.json(
          { error: 'Gebruiker niet gevonden' },
          { status: 404 }
        );
      }

      if (user.emailVerified) {
        return NextResponse.json(
          { error: 'Email is al geverifieerd' },
          { status: 400 }
        );
      }

      // Check for existing token or create new one
      let tokenData = getVerificationByUserId(userId);
      
      if (!tokenData) {
        const newToken = createVerificationToken(userId, user.email);
        tokenData = { ...newToken, email: user.email };
      }

      // Send verification email
      const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${tokenData.token}`;
      await sendVerificationEmail(
        user.email,
        user.name || 'Gebruiker',
        verifyUrl,
        tokenData.code
      );

      return NextResponse.json({
        success: true,
        message: 'Verificatie email verstuurd'
      });
    }

    return NextResponse.json(
      { error: 'Ongeldige aanvraag' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Er is iets misgegaan' },
      { status: 500 }
    );
  }
}
