import nodemailer from 'nodemailer';
import {
  welcomeEmail,
  verificationEmail,
  passwordResetEmail,
  downtimeAlertEmail,
  recoveryAlertEmail,
  sslWarningEmail,
  upgradeConfirmationEmail,
  weeklyReportEmail,
} from './email/templates';

// SMTP Configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'webstability.nl',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true, // SSL
  auth: {
    user: process.env.SMTP_USER || 'info@webstability.nl',
    pass: process.env.SMTP_PASS,
  },
});

// Base send function
async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.SMTP_PASS) {
    console.log('SMTP not configured, skipping email:', subject);
    return { success: false, error: 'SMTP not configured' };
  }

  try {
    await transporter.sendMail({
      from: '"webstability" <info@webstability.nl>',
      to,
      subject,
      html,
    });
    console.log(`Email sent: ${subject} to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}

// ============================================
// PUBLIC EMAIL FUNCTIONS
// ============================================

// Welcome email after registration
export async function sendWelcomeEmail(to: string, name: string) {
  const { subject, html } = welcomeEmail({
    userName: name,
    loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  });
  return sendEmail(to, subject, html);
}

// Email verification
export async function sendVerificationEmail(to: string, name: string, verifyUrl: string, code?: string) {
  const { subject, html } = verificationEmail({
    userName: name,
    verifyUrl,
    code,
  });
  return sendEmail(to, subject, html);
}

// Password reset
export async function sendPasswordResetEmail(to: string, name: string, resetUrl: string) {
  const { subject, html } = passwordResetEmail({
    userName: name,
    resetUrl,
  });
  return sendEmail(to, subject, html);
}

// Downtime alert
export async function sendDowntimeAlert(
  to: string, 
  siteName: string, 
  siteUrl: string, 
  isDown: boolean, 
  error?: string,
  downtimeStart?: Date
) {
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/sites`;
  
  if (isDown) {
    const { subject, html } = downtimeAlertEmail({
      userName: 'Gebruiker',
      siteName,
      siteUrl,
      error,
      detectedAt: new Date(),
      dashboardUrl,
    });
    return sendEmail(to, subject, html);
  } else {
    // Calculate downtime duration
    const downtimeDuration = downtimeStart 
      ? formatDuration(new Date().getTime() - downtimeStart.getTime())
      : 'onbekend';
    
    const { subject, html } = recoveryAlertEmail({
      userName: 'Gebruiker',
      siteName,
      siteUrl,
      downtimeDuration,
      recoveredAt: new Date(),
      dashboardUrl,
    });
    return sendEmail(to, subject, html);
  }
}

// SSL warning
export async function sendSSLWarningEmail(
  to: string,
  siteName: string,
  siteUrl: string,
  expiresAt: Date,
  daysRemaining: number
) {
  const { subject, html } = sslWarningEmail({
    userName: 'Gebruiker',
    siteName,
    siteUrl,
    expiresAt,
    daysRemaining,
    dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/sites`,
  });
  return sendEmail(to, subject, html);
}

// Upgrade confirmation
export async function sendUpgradeConfirmationEmail(
  to: string,
  userName: string,
  planName: string,
  amount: string,
  billingCycle: 'monthly' | 'yearly',
  nextBillingDate: Date,
  invoiceUrl?: string
) {
  const { subject, html } = upgradeConfirmationEmail({
    userName,
    planName,
    amount,
    billingCycle,
    nextBillingDate,
    invoiceUrl,
    dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  });
  return sendEmail(to, subject, html);
}

// Weekly report
export async function sendWeeklyReportEmail(
  to: string,
  userName: string,
  data: {
    period: string;
    totalSites: number;
    avgUptime: string;
    totalIncidents: number;
    totalAlerts: number;
    sites: Array<{
      name: string;
      url: string;
      uptime: string;
      avgResponseTime: number;
      incidents: number;
      status: 'up' | 'down' | 'degraded';
    }>;
    dashboardUrl: string;
  }
) {
  // Find top performer and needs attention
  const sortedByUptime = [...data.sites].sort((a, b) => parseFloat(b.uptime) - parseFloat(a.uptime));
  const topPerformer = sortedByUptime[0];
  const needsAttention = sortedByUptime.find(s => parseFloat(s.uptime) < 99);

  const { subject, html } = weeklyReportEmail({
    userName,
    weekNumber: getWeekNumber(new Date()),
    totalSites: data.totalSites,
    avgUptime: parseFloat(data.avgUptime),
    totalIncidents: data.totalIncidents,
    topPerformer: topPerformer ? { name: topPerformer.name, uptime: parseFloat(topPerformer.uptime) } : { name: 'N/A', uptime: 100 },
    needsAttention: needsAttention ? { name: needsAttention.name, uptime: parseFloat(needsAttention.uptime) } : undefined,
    dashboardUrl: data.dashboardUrl,
  });
  return sendEmail(to, subject, html);
}

// Get ISO week number
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

// Legacy alert email (for backwards compatibility)
export async function sendAlertEmail(
  to: string,
  subject: string,
  siteName: string,
  alertType: string,
  message: string
) {
  // Use new downtime template
  if (alertType === 'downtime') {
    return sendDowntimeAlert(to, siteName, '', true, message);
  } else if (alertType === 'recovery') {
    return sendDowntimeAlert(to, siteName, '', false);
  }
  
  // Fallback for other alert types
  const { html } = downtimeAlertEmail({
    userName: 'Gebruiker',
    siteName,
    siteUrl: '',
    error: message,
    detectedAt: new Date(),
    dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  });
  return sendEmail(to, subject, html);
}

// ============================================
// HELPERS
// ============================================

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days} dag${days > 1 ? 'en' : ''} ${hours % 24} uur`;
  } else if (hours > 0) {
    return `${hours} uur ${minutes % 60} min`;
  } else if (minutes > 0) {
    return `${minutes} minuten`;
  } else {
    return `${seconds} seconden`;
  }
}
