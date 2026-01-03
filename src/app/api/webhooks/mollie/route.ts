import { NextRequest, NextResponse } from 'next/server';
import { getPayment } from '@/lib/mollie';
import { db, users } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.formData();
    const paymentId = body.get('id') as string;

    if (!paymentId) {
      return NextResponse.json({ error: 'No payment ID' }, { status: 400 });
    }

    const payment = await getPayment(paymentId);
    
    if (payment.status === 'paid') {
      const metadata = payment.metadata as { plan?: string; customerId?: string };
      const plan = metadata?.plan || 'pro';
      const customerId = metadata?.customerId;

      if (customerId) {
        await db
          .update(users)
          .set({
            plan,
            stripeSubscriptionId: paymentId, // Reuse field for payment tracking
            updatedAt: new Date(),
          })
          .where(eq(users.stripeCustomerId, customerId));
      }
    } else if (payment.status === 'failed' || payment.status === 'canceled' || payment.status === 'expired') {
      // Payment failed - keep user on free plan
      const metadata = payment.metadata as { customerId?: string };
      const customerId = metadata?.customerId;

      if (customerId) {
        await db
          .update(users)
          .set({
            plan: 'free',
            updatedAt: new Date(),
          })
          .where(eq(users.stripeCustomerId, customerId));
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Mollie webhook error:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}
