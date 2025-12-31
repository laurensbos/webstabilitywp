import { NextRequest, NextResponse } from 'next/server';
import { db, users } from '@/lib/db';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { sendWelcomeEmail } from '@/lib/email';
import { createCustomer } from '@/lib/mollie';

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

    // Create Mollie customer (optional, can be created later at checkout)
    let mollieCustomerId: string | undefined;
    try {
      const customer = await createCustomer(email, name);
      mollieCustomerId = customer.id;
    } catch (error) {
      console.error('Failed to create Mollie customer:', error);
      // Not critical - we'll create it at checkout
    }

    // Create user
    const [user] = await db
      .insert(users)
      .values({
        email: email.toLowerCase(),
        name: name || null,
        passwordHash,
        stripeCustomerId: mollieCustomerId, // Reuse field for Mollie
        plan: 'free',
      })
      .returning();

    // Send welcome email
    try {
      await sendWelcomeEmail(email, name || 'daar');
    } catch (error) {
      console.error('Failed to send welcome email:', error);
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
