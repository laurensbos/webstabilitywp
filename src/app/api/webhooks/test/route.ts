import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, webhooks } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { 
  sendSlackWebhook, 
  sendDiscordWebhook, 
  sendTeamsWebhook, 
  sendGenericWebhook 
} from '@/lib/webhooks';

// POST - Test a webhook
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { webhookId } = await request.json();

    if (!webhookId) {
      return NextResponse.json({ error: 'Webhook ID is verplicht' }, { status: 400 });
    }

    // Get webhook
    const [webhook] = await db
      .select()
      .from(webhooks)
      .where(and(
        eq(webhooks.id, webhookId),
        eq(webhooks.userId, session.user.id)
      ));

    if (!webhook) {
      return NextResponse.json({ error: 'Webhook niet gevonden' }, { status: 404 });
    }

    // Create test payload
    const testPayload = {
      siteName: 'Test Website',
      siteUrl: 'https://example.com',
      status: 'down' as const,
      message: '🧪 Dit is een test melding van webstability. Je webhook werkt correct!',
      timestamp: new Date(),
      responseTime: 0,
    };

    // Send test based on type
    let success = false;
    
    switch (webhook.type) {
      case 'slack':
        success = await sendSlackWebhook(webhook.url, testPayload);
        break;
      case 'discord':
        success = await sendDiscordWebhook(webhook.url, testPayload);
        break;
      case 'teams':
        success = await sendTeamsWebhook(webhook.url, testPayload);
        break;
      case 'generic':
        success = await sendGenericWebhook(webhook.url, testPayload);
        break;
      default:
        return NextResponse.json({ error: 'Onbekend webhook type' }, { status: 400 });
    }

    if (success) {
      // Update last triggered
      await db
        .update(webhooks)
        .set({ lastTriggeredAt: new Date() })
        .where(eq(webhooks.id, webhookId));

      return NextResponse.json({ 
        success: true, 
        message: 'Test melding succesvol verzonden!' 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Kon geen verbinding maken met de webhook URL. Controleer de URL en probeer opnieuw.' 
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error testing webhook:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
