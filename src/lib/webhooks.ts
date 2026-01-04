// Webhook integration utilities for Slack, Discord, and Microsoft Teams
import { db, webhooks } from '@/lib/db';
import { eq, and } from 'drizzle-orm';

interface WebhookPayload {
  siteName: string;
  siteUrl: string;
  status: 'down' | 'up' | 'degraded' | 'ssl_expiring' | 'ssl_expired';
  message: string;
  timestamp: Date;
  responseTime?: number;
  error?: string;
}

// Slack webhook
export async function sendSlackWebhook(webhookUrl: string, payload: WebhookPayload): Promise<boolean> {
  try {
    const color = payload.status === 'up' ? '#6366f1' : 
                  payload.status === 'down' ? '#ef4444' : 
                  payload.status === 'degraded' ? '#f59e0b' : '#3b82f6';
    
    const statusEmoji = payload.status === 'up' ? '✅' : 
                        payload.status === 'down' ? '🔴' : 
                        payload.status === 'degraded' ? '🟡' : '🔒';

    const slackPayload = {
      attachments: [{
        color,
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: `${statusEmoji} ${payload.siteName}`,
              emoji: true
            }
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*Status:*\n${getStatusLabel(payload.status)}`
              },
              {
                type: 'mrkdwn',
                text: `*URL:*\n<${payload.siteUrl}|${payload.siteUrl}>`
              }
            ]
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Bericht:*\n${payload.message}`
            }
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `⏰ ${payload.timestamp.toLocaleString('nl-NL')} | Powered by webstability`
              }
            ]
          }
        ]
      }]
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slackPayload)
    });

    return response.ok;
  } catch (error) {
    console.error('Slack webhook error:', error);
    return false;
  }
}

// Discord webhook
export async function sendDiscordWebhook(webhookUrl: string, payload: WebhookPayload): Promise<boolean> {
  try {
    const color = payload.status === 'up' ? 0x22c55e : 
                  payload.status === 'down' ? 0xef4444 : 
                  payload.status === 'degraded' ? 0xf59e0b : 0x3b82f6;

    const statusEmoji = payload.status === 'up' ? '✅' : 
                        payload.status === 'down' ? '🔴' : 
                        payload.status === 'degraded' ? '🟡' : '🔒';

    const discordPayload = {
      embeds: [{
        title: `${statusEmoji} ${payload.siteName}`,
        url: payload.siteUrl,
        color,
        fields: [
          {
            name: 'Status',
            value: getStatusLabel(payload.status),
            inline: true
          },
          {
            name: 'URL',
            value: payload.siteUrl,
            inline: true
          },
          {
            name: 'Bericht',
            value: payload.message,
            inline: false
          }
        ],
        footer: {
          text: 'Powered by webstability'
        },
        timestamp: payload.timestamp.toISOString()
      }]
    };

    if (payload.responseTime) {
      discordPayload.embeds[0].fields.push({
        name: 'Response Time',
        value: `${payload.responseTime}ms`,
        inline: true
      });
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordPayload)
    });

    return response.ok;
  } catch (error) {
    console.error('Discord webhook error:', error);
    return false;
  }
}

// Microsoft Teams webhook
export async function sendTeamsWebhook(webhookUrl: string, payload: WebhookPayload): Promise<boolean> {
  try {
    const themeColor = payload.status === 'up' ? '22c55e' : 
                       payload.status === 'down' ? 'ef4444' : 
                       payload.status === 'degraded' ? 'f59e0b' : '3b82f6';

    const statusEmoji = payload.status === 'up' ? '✅' : 
                        payload.status === 'down' ? '🔴' : 
                        payload.status === 'degraded' ? '🟡' : '🔒';

    // Adaptive Card format for Teams
    const teamsPayload = {
      type: 'message',
      attachments: [{
        contentType: 'application/vnd.microsoft.card.adaptive',
        content: {
          $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
          type: 'AdaptiveCard',
          version: '1.4',
          body: [
            {
              type: 'TextBlock',
              text: `${statusEmoji} ${payload.siteName}`,
              weight: 'Bolder',
              size: 'Large'
            },
            {
              type: 'FactSet',
              facts: [
                { title: 'Status', value: getStatusLabel(payload.status) },
                { title: 'URL', value: payload.siteUrl },
                { title: 'Tijd', value: payload.timestamp.toLocaleString('nl-NL') }
              ]
            },
            {
              type: 'TextBlock',
              text: payload.message,
              wrap: true
            }
          ],
          actions: [
            {
              type: 'Action.OpenUrl',
              title: 'Open Dashboard',
              url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
            },
            {
              type: 'Action.OpenUrl',
              title: 'Bekijk Site',
              url: payload.siteUrl
            }
          ]
        }
      }]
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(teamsPayload)
    });

    return response.ok;
  } catch (error) {
    console.error('Teams webhook error:', error);
    return false;
  }
}

// Generic webhook (custom URL)
export async function sendGenericWebhook(webhookUrl: string, payload: WebhookPayload): Promise<boolean> {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': 'WebStability/1.0'
      },
      body: JSON.stringify({
        event: payload.status === 'up' ? 'site.recovered' : 'site.down',
        site: {
          name: payload.siteName,
          url: payload.siteUrl
        },
        status: payload.status,
        message: payload.message,
        responseTime: payload.responseTime,
        error: payload.error,
        timestamp: payload.timestamp.toISOString()
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Generic webhook error:', error);
    return false;
  }
}

// Send to all configured webhooks for a user
export async function sendWebhookNotifications(
  webhooks: Array<{ type: 'slack' | 'discord' | 'teams' | 'generic'; url: string }>,
  payload: WebhookPayload
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const webhook of webhooks) {
    let result = false;

    switch (webhook.type) {
      case 'slack':
        result = await sendSlackWebhook(webhook.url, payload);
        break;
      case 'discord':
        result = await sendDiscordWebhook(webhook.url, payload);
        break;
      case 'teams':
        result = await sendTeamsWebhook(webhook.url, payload);
        break;
      case 'generic':
        result = await sendGenericWebhook(webhook.url, payload);
        break;
    }

    if (result) {
      success++;
    } else {
      failed++;
    }
  }

  return { success, failed };
}

// Helper function
function getStatusLabel(status: WebhookPayload['status']): string {
  switch (status) {
    case 'up': return 'Online ✓';
    case 'down': return 'Offline ✗';
    case 'degraded': return 'Traag ⚠';
    case 'ssl_expiring': return 'SSL verloopt binnenkort';
    case 'ssl_expired': return 'SSL verlopen';
    default: return status;
  }
}

// Map alert types to event types for filtering
function getEventType(status: WebhookPayload['status']): string {
  switch (status) {
    case 'up': return 'site_up';
    case 'down': return 'site_down';
    case 'degraded': return 'performance';
    case 'ssl_expiring': return 'ssl_expiring';
    case 'ssl_expired': return 'ssl_expired';
    default: return 'site_down';
  }
}

// Trigger webhooks for a user based on event type
export async function triggerWebhooks(
  userId: string,
  payload: WebhookPayload
): Promise<{ success: number; failed: number }> {
  try {
    const eventType = getEventType(payload.status);
    
    // Get all active webhooks for this user
    const userWebhooks = await db
      .select()
      .from(webhooks)
      .where(and(
        eq(webhooks.userId, userId),
        eq(webhooks.isActive, true)
      ));
    
    // Filter webhooks that are subscribed to this event
    const relevantWebhooks = userWebhooks.filter(w => 
      w.events && w.events.includes(eventType)
    );
    
    if (relevantWebhooks.length === 0) {
      return { success: 0, failed: 0 };
    }
    
    // Send to all relevant webhooks
    let success = 0;
    let failed = 0;
    
    for (const webhook of relevantWebhooks) {
      let result = false;
      
      switch (webhook.type) {
        case 'slack':
          result = await sendSlackWebhook(webhook.url, payload);
          break;
        case 'discord':
          result = await sendDiscordWebhook(webhook.url, payload);
          break;
        case 'teams':
          result = await sendTeamsWebhook(webhook.url, payload);
          break;
        case 'generic':
          result = await sendGenericWebhook(webhook.url, payload);
          break;
      }
      
      if (result) {
        success++;
        // Update last triggered timestamp
        await db
          .update(webhooks)
          .set({ lastTriggeredAt: new Date() })
          .where(eq(webhooks.id, webhook.id));
      } else {
        failed++;
      }
    }
    
    return { success, failed };
  } catch (error) {
    console.error('Error triggering webhooks:', error);
    return { success: 0, failed: 0 };
  }
}
