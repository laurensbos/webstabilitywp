import { NextRequest, NextResponse } from 'next/server';
import { db, users } from '@/lib/db';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email en wachtwoord zijn verplicht' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()));

    if (existingUser) {
      return NextResponse.json(
        { error: 'Dit emailadres is al in gebruik' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create Mollie customer (optional, skip if not configured)
    let mollieCustomerId: string | undefined;
    if (process.env.MOLLIE_API_KEY) {
      try {
        const { createCustomer } = await import('@/lib/mollie');
        const customer = await createCustomer(email, name);
        mollieCustomerId = customer.id;
      } catch (error) {
        console.error('Failed to create Mollie customer:', error);
        // Not critical - we'll create it at checkout
      }
    }

    // Create user
    const [user] = await db
      .insert(users)
      .values({
        email: email.toLowerCase(),
        name: name || null,
        passwordHash,
        stripeCustomerId: mollieCustomerId || null,
        plan: 'free',
      })
      .returning();

    // Send welcome email (non-blocking)
    if (process.env.SMTP_PASS) {
      try {
        const { sendWelcomeEmail, sendVerificationEmail } = await import('@/lib/email');
        const { createVerificationToken } = await import('@/lib/auth/tokens');
        
        await sendWelcomeEmail(email, name || 'daar');
        
        const { token, code } = createVerificationToken(user.id, email);
        const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;
        await sendVerificationEmail(email, name || 'Gebruiker', verifyUrl, code);
      } catch (error) {
        console.error('Failed to send emails:', error);
        // Continue - registration was successful
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Er is iets misgegaan' },
      { status: 500 }
    );
  }
}
