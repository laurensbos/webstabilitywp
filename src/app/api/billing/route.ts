import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, users } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { createFirstPayment, createCustomer } from '@/lib/mollie';
import { PLANS, PlanType } from '@/lib/plans';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan } = await request.json();

    if (!plan || !PLANS[plan as PlanType]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id));

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 400 });
    }

    // Create Mollie customer if not exists
    let mollieCustomerId = user.stripeCustomerId; // We reuse this field for Mollie
    if (!mollieCustomerId) {
      const mollieCustomer = await createCustomer(user.email, user.name || undefined);
      mollieCustomerId = mollieCustomer.id;
      
      await db
        .update(users)
        .set({ stripeCustomerId: mollieCustomerId })
        .where(eq(users.id, user.id));
    }

    // Create first payment to set up mandate
    const payment = await createFirstPayment(
      mollieCustomerId,
      plan,
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true&plan=${plan}`
    );

    return NextResponse.json({ url: payment.getCheckoutUrl() });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Mollie doesn't have a customer portal like Stripe
    // Redirect to our settings page instead
    return NextResponse.json({ 
      url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings` 
    });
  } catch (error) {
    console.error('Portal error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
