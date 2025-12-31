import createMollieClient, { MollieClient, SequenceType } from '@mollie/api-client';

// Lazy initialization to avoid build-time errors
let mollieInstance: MollieClient | null = null;

export function getMollie(): MollieClient {
  if (!mollieInstance) {
    if (!process.env.MOLLIE_API_KEY) {
      throw new Error('MOLLIE_API_KEY is not configured');
    }
    mollieInstance = createMollieClient({ apiKey: process.env.MOLLIE_API_KEY });
  }
  return mollieInstance;
}

// Plan prices in cents
const PLAN_PRICES: Record<string, { amount: string; description: string }> = {
  starter: { amount: '9.00', description: 'Web Stability Starter - Maandelijks' },
  pro: { amount: '29.00', description: 'Web Stability Pro - Maandelijks' },
  agency: { amount: '79.00', description: 'Web Stability Agency - Maandelijks' },
};

export async function createCustomer(email: string, name?: string) {
  const mollie = getMollie();
  return mollie.customers.create({
    email,
    name: name || email,
  });
}

export async function createFirstPayment(
  customerId: string,
  plan: string,
  redirectUrl: string
) {
  const mollie = getMollie();
  const planInfo = PLAN_PRICES[plan];
  
  if (!planInfo) {
    throw new Error(`Unknown plan: ${plan}`);
  }

  // Create first payment to set up the mandate for recurring payments
  return mollie.payments.create({
    amount: {
      currency: 'EUR',
      value: planInfo.amount,
    },
    customerId,
    description: planInfo.description,
    redirectUrl,
    webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mollie`,
    sequenceType: SequenceType.first,
    metadata: {
      plan,
      customerId,
    },
  });
}

export async function createRecurringPayment(
  customerId: string,
  plan: string
) {
  const mollie = getMollie();
  const planInfo = PLAN_PRICES[plan];
  
  if (!planInfo) {
    throw new Error(`Unknown plan: ${plan}`);
  }

  return mollie.payments.create({
    amount: {
      currency: 'EUR',
      value: planInfo.amount,
    },
    customerId,
    description: planInfo.description,
    webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mollie`,
    sequenceType: SequenceType.recurring,
    metadata: {
      plan,
      customerId,
    },
  });
}

export async function getPayment(paymentId: string) {
  const mollie = getMollie();
  return mollie.payments.get(paymentId);
}

export async function getCustomerMandates(customerId: string) {
  const mollie = getMollie();
  return mollie.customerMandates.page({ customerId });
}

export async function cancelSubscription(customerId: string) {
  // For Mollie, we just stop creating recurring payments
  // The subscription status is managed in our database
  return { success: true };
}
