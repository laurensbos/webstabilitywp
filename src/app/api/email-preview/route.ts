import { NextRequest, NextResponse } from 'next/server';
import {
  welcomeEmail,
  verificationEmail,
  passwordResetEmail,
  downtimeAlertEmail,
  recoveryAlertEmail,
  sslWarningEmail,
  upgradeConfirmationEmail,
  weeklyReportEmail,
} from '@/lib/email/templates';

// Email preview endpoint - only available in development
export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const template = searchParams.get('template') || 'welcome';

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const templates: Record<string, { subject: string; html: string }> = {
    welcome: welcomeEmail({
      userName: 'Jan',
      loginUrl: `${baseUrl}/dashboard`,
    }),
    verification: verificationEmail({
      userName: 'Jan',
      verifyUrl: `${baseUrl}/verify?token=abc123`,
      code: '847291',
    }),
    'password-reset': passwordResetEmail({
      userName: 'Jan',
      resetUrl: `${baseUrl}/reset-password?token=abc123`,
    }),
    downtime: downtimeAlertEmail({
      userName: 'Jan',
      siteName: 'Mijn Website',
      siteUrl: 'https://mijnwebsite.nl',
      error: 'Connection timeout after 30 seconds',
      detectedAt: new Date(),
      dashboardUrl: `${baseUrl}/dashboard/sites`,
    }),
    recovery: recoveryAlertEmail({
      userName: 'Jan',
      siteName: 'Mijn Website',
      siteUrl: 'https://mijnwebsite.nl',
      downtimeDuration: '23 minuten',
      recoveredAt: new Date(),
      dashboardUrl: `${baseUrl}/dashboard/sites`,
    }),
    'ssl-warning': sslWarningEmail({
      userName: 'Jan',
      siteName: 'Mijn Website',
      siteUrl: 'mijnwebsite.nl',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      daysRemaining: 7,
      dashboardUrl: `${baseUrl}/dashboard/sites`,
    }),
    upgrade: upgradeConfirmationEmail({
      userName: 'Jan',
      planName: 'Pro',
      amount: '€9',
      billingCycle: 'monthly',
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      invoiceUrl: `${baseUrl}/invoices/INV-001`,
      dashboardUrl: `${baseUrl}/dashboard`,
    }),
    'weekly-report': weeklyReportEmail({
      userName: 'Jan',
      weekNumber: 1,
      totalSites: 5,
      avgUptime: 99.87,
      totalIncidents: 2,
      topPerformer: { name: 'API Server', uptime: 100 },
      needsAttention: { name: 'Blog', uptime: 98.2 },
      dashboardUrl: `${baseUrl}/dashboard`,
    }),
  };

  const selectedTemplate = templates[template];

  if (!selectedTemplate) {
    // Return list of available templates
    return new NextResponse(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Email Preview</title>
          <style>
            body { font-family: system-ui; padding: 40px; background: #0a0c0b; color: #fff; }
            h1 { color: #22c55e; }
            a { color: #22c55e; display: block; padding: 10px 0; font-size: 18px; }
          </style>
        </head>
        <body>
          <h1>📧 Email Templates</h1>
          <p>Selecteer een template om te bekijken:</p>
          ${Object.keys(templates).map(t => `<a href="?template=${t}">${t}</a>`).join('')}
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  // Return the email HTML with a wrapper showing subject
  return new NextResponse(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Email Preview: ${selectedTemplate.subject}</title>
        <style>
          .preview-bar {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: #1a1a1a;
            padding: 12px 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-family: system-ui;
            z-index: 1000;
            border-bottom: 1px solid #333;
          }
          .preview-bar a { color: #22c55e; text-decoration: none; }
          .preview-bar span { color: #fff; }
          .preview-bar .subject { color: #888; font-size: 14px; }
          .email-frame { padding-top: 60px; }
        </style>
      </head>
      <body style="margin: 0; padding: 0;">
        <div class="preview-bar">
          <a href="/api/email-preview">← Alle templates</a>
          <span>Preview: <strong>${template}</strong></span>
          <span class="subject">Subject: ${selectedTemplate.subject}</span>
        </div>
        <div class="email-frame">
          ${selectedTemplate.html}
        </div>
      </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html' },
  });
}
