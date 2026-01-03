// Email template system with webstability branding
// Dark theme with green accents matching the homepage

interface EmailTemplateData {
  userName?: string;
  [key: string]: string | number | undefined;
}

// Base email wrapper with branding
function emailWrapper(content: string, preheader: string = ''): string {
  return `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>webstability</title>
  <!--[if mso]>
  <style type="text/css">
    table { border-collapse: collapse; }
    .fallback-font { font-family: Arial, sans-serif !important; }
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #0a0c0b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <!-- Preheader text (hidden) -->
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
    ${preheader}
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>
  
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0a0c0b;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
          
          <!-- Logo Header -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background: linear-gradient(135deg, #22c55e, #16a34a); width: 44px; height: 44px; border-radius: 12px; text-align: center; vertical-align: middle;">
                    <span style="color: #000; font-size: 24px; font-weight: bold;">⚡</span>
                  </td>
                  <td style="padding-left: 12px;">
                    <span style="color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">webstability</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Main Content Card -->
          <tr>
            <td>
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background: linear-gradient(180deg, rgba(25, 30, 35, 0.95), rgba(20, 24, 28, 0.95)); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 20px;">
                <tr>
                  <td style="padding: 40px;">
                    ${content}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom: 16px;">
                    <a href="https://webstability.nl" style="color: rgba(255, 255, 255, 0.5); text-decoration: none; font-size: 13px; margin: 0 12px;">Website</a>
                    <span style="color: rgba(255, 255, 255, 0.2);">•</span>
                    <a href="https://webstability.nl/dashboard" style="color: rgba(255, 255, 255, 0.5); text-decoration: none; font-size: 13px; margin: 0 12px;">Dashboard</a>
                    <span style="color: rgba(255, 255, 255, 0.2);">•</span>
                    <a href="https://webstability.nl/help" style="color: rgba(255, 255, 255, 0.5); text-decoration: none; font-size: 13px; margin: 0 12px;">Help</a>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <p style="color: rgba(255, 255, 255, 0.3); font-size: 12px; margin: 0; line-height: 1.6;">
                      © ${new Date().getFullYear()} webstability. Alle rechten voorbehouden.<br>
                      Je ontvangt deze email omdat je een account hebt bij webstability.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// Reusable button component
function emailButton(text: string, url: string, variant: 'primary' | 'secondary' = 'primary'): string {
  const styles = variant === 'primary'
    ? 'background: linear-gradient(135deg, #22c55e, #16a34a); color: #000000;'
    : 'background: rgba(255, 255, 255, 0.1); color: #ffffff; border: 1px solid rgba(255, 255, 255, 0.2);';
  
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
      <tr>
        <td style="${styles} padding: 14px 32px; border-radius: 12px; text-align: center;">
          <a href="${url}" style="color: inherit; text-decoration: none; font-weight: 600; font-size: 15px; display: block;">${text}</a>
        </td>
      </tr>
    </table>
  `;
}

// Status badge component
function statusBadge(status: 'up' | 'down' | 'warning' | 'info'): string {
  const config = {
    up: { bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.3)', color: '#22c55e', icon: '✓', text: 'Online' },
    down: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)', color: '#ef4444', icon: '✗', text: 'Offline' },
    warning: { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)', color: '#f59e0b', icon: '⚠', text: 'Waarschuwing' },
    info: { bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.3)', color: '#3b82f6', icon: 'ℹ', text: 'Info' },
  }[status];
  
  return `
    <span style="display: inline-block; background: ${config.bg}; border: 1px solid ${config.border}; color: ${config.color}; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 500;">
      ${config.icon} ${config.text}
    </span>
  `;
}

// ============================================
// EMAIL TEMPLATES
// ============================================

// 1. Welcome Email - After registration
export function welcomeEmail(data: { userName: string; loginUrl: string }): { subject: string; html: string } {
  const content = `
    <!-- Welcome Icon -->
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; width: 72px; height: 72px; background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.1)); border-radius: 50%; line-height: 72px; font-size: 32px;">
        🎉
      </div>
    </div>
    
    <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; text-align: center; margin: 0 0 8px 0;">
      Welkom bij webstability!
    </h1>
    <p style="color: rgba(255, 255, 255, 0.6); font-size: 16px; text-align: center; margin: 0 0 32px 0;">
      Hoi ${data.userName}, je account is aangemaakt
    </p>
    
    <div style="background: rgba(0, 0, 0, 0.3); border-radius: 16px; padding: 24px; margin-bottom: 24px;">
      <h2 style="color: #ffffff; font-size: 16px; font-weight: 600; margin: 0 0 16px 0;">
        Aan de slag in 3 stappen:
      </h2>
      
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
            <table role="presentation" cellpadding="0" cellspacing="0">
              <tr>
                <td style="width: 32px; height: 32px; background: rgba(34, 197, 94, 0.2); border-radius: 50%; text-align: center; vertical-align: middle; color: #22c55e; font-weight: 600;">1</td>
                <td style="padding-left: 16px; color: rgba(255, 255, 255, 0.8); font-size: 15px;">Voeg je eerste website toe</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
            <table role="presentation" cellpadding="0" cellspacing="0">
              <tr>
                <td style="width: 32px; height: 32px; background: rgba(34, 197, 94, 0.2); border-radius: 50%; text-align: center; vertical-align: middle; color: #22c55e; font-weight: 600;">2</td>
                <td style="padding-left: 16px; color: rgba(255, 255, 255, 0.8); font-size: 15px;">Configureer je notificaties</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0;">
            <table role="presentation" cellpadding="0" cellspacing="0">
              <tr>
                <td style="width: 32px; height: 32px; background: rgba(34, 197, 94, 0.2); border-radius: 50%; text-align: center; vertical-align: middle; color: #22c55e; font-weight: 600;">3</td>
                <td style="padding-left: 16px; color: rgba(255, 255, 255, 0.8); font-size: 15px;">Ontspan - wij monitoren 24/7</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
    
    <div style="text-align: center;">
      ${emailButton('Naar mijn dashboard →', data.loginUrl)}
    </div>
    
    <p style="color: rgba(255, 255, 255, 0.5); font-size: 14px; text-align: center; margin: 24px 0 0 0;">
      Vragen? Reply gewoon op deze email, we helpen je graag!
    </p>
  `;
  
  return {
    subject: '🎉 Welkom bij webstability!',
    html: emailWrapper(content, `Hoi ${data.userName}, welkom bij webstability! Je account is klaar om te gebruiken.`)
  };
}

// 2. Email Verification
export function verificationEmail(data: { userName: string; verifyUrl: string; code?: string }): { subject: string; html: string } {
  const content = `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; width: 72px; height: 72px; background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.1)); border-radius: 50%; line-height: 72px; font-size: 32px;">
        ✉️
      </div>
    </div>
    
    <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; text-align: center; margin: 0 0 8px 0;">
      Bevestig je e-mailadres
    </h1>
    <p style="color: rgba(255, 255, 255, 0.6); font-size: 16px; text-align: center; margin: 0 0 32px 0;">
      Hoi ${data.userName}, klik op de knop hieronder om je e-mailadres te bevestigen
    </p>
    
    <div style="text-align: center;">
      ${emailButton('E-mailadres bevestigen', data.verifyUrl)}
    </div>
    
    ${data.code ? `
    <div style="background: rgba(0, 0, 0, 0.3); border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center;">
      <p style="color: rgba(255, 255, 255, 0.5); font-size: 13px; margin: 0 0 8px 0;">Of gebruik deze code:</p>
      <p style="color: #22c55e; font-size: 32px; font-weight: 700; letter-spacing: 8px; margin: 0; font-family: monospace;">${data.code}</p>
    </div>
    ` : ''}
    
    <p style="color: rgba(255, 255, 255, 0.4); font-size: 13px; text-align: center; margin: 24px 0 0 0;">
      Deze link is 24 uur geldig. Als je geen account hebt aangemaakt, kun je deze email negeren.
    </p>
  `;
  
  return {
    subject: '✉️ Bevestig je e-mailadres',
    html: emailWrapper(content, `Bevestig je e-mailadres om je account te activeren.`)
  };
}

// 3. Password Reset
export function passwordResetEmail(data: { userName: string; resetUrl: string }): { subject: string; html: string } {
  const content = `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; width: 72px; height: 72px; background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.1)); border-radius: 50%; line-height: 72px; font-size: 32px;">
        🔐
      </div>
    </div>
    
    <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; text-align: center; margin: 0 0 8px 0;">
      Wachtwoord resetten
    </h1>
    <p style="color: rgba(255, 255, 255, 0.6); font-size: 16px; text-align: center; margin: 0 0 32px 0;">
      Hoi ${data.userName}, we ontvingen een verzoek om je wachtwoord te resetten
    </p>
    
    <div style="text-align: center;">
      ${emailButton('Nieuw wachtwoord instellen', data.resetUrl)}
    </div>
    
    <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.2); border-radius: 12px; padding: 16px; margin: 24px 0;">
      <p style="color: #f59e0b; font-size: 14px; margin: 0;">
        ⚠️ <strong>Let op:</strong> Deze link is 1 uur geldig. Heb je dit verzoek niet gedaan? Negeer deze email dan.
      </p>
    </div>
    
    <p style="color: rgba(255, 255, 255, 0.4); font-size: 13px; text-align: center; margin: 0;">
      Als de knop niet werkt, kopieer dan deze link:<br>
      <a href="${data.resetUrl}" style="color: #22c55e; word-break: break-all;">${data.resetUrl}</a>
    </p>
  `;
  
  return {
    subject: '🔐 Wachtwoord resetten',
    html: emailWrapper(content, `Reset je wachtwoord voor webstability.`)
  };
}

// 4. Downtime Alert
export function downtimeAlertEmail(data: { 
  userName: string; 
  siteName: string; 
  siteUrl: string; 
  error?: string;
  detectedAt: Date;
  dashboardUrl: string;
}): { subject: string; html: string } {
  const content = `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; width: 72px; height: 72px; background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1)); border-radius: 50%; line-height: 72px; font-size: 32px;">
        🔴
      </div>
    </div>
    
    <h1 style="color: #ef4444; font-size: 28px; font-weight: 700; text-align: center; margin: 0 0 8px 0;">
      Site Offline Gedetecteerd
    </h1>
    <p style="color: rgba(255, 255, 255, 0.6); font-size: 16px; text-align: center; margin: 0 0 32px 0;">
      We konden geen verbinding maken met je website
    </p>
    
    <div style="background: rgba(0, 0, 0, 0.3); border-radius: 16px; padding: 24px; margin-bottom: 24px;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding: 8px 0;">
            <span style="color: rgba(255, 255, 255, 0.5); font-size: 13px;">Website</span><br>
            <span style="color: #ffffff; font-size: 16px; font-weight: 600;">${data.siteName}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-top: 1px solid rgba(255, 255, 255, 0.05);">
            <span style="color: rgba(255, 255, 255, 0.5); font-size: 13px;">URL</span><br>
            <a href="${data.siteUrl}" style="color: #22c55e; font-size: 15px; text-decoration: none;">${data.siteUrl}</a>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-top: 1px solid rgba(255, 255, 255, 0.05);">
            <span style="color: rgba(255, 255, 255, 0.5); font-size: 13px;">Gedetecteerd op</span><br>
            <span style="color: #ffffff; font-size: 15px;">${data.detectedAt.toLocaleString('nl-NL', { dateStyle: 'long', timeStyle: 'short' })}</span>
          </td>
        </tr>
        ${data.error ? `
        <tr>
          <td style="padding: 8px 0; border-top: 1px solid rgba(255, 255, 255, 0.05);">
            <span style="color: rgba(255, 255, 255, 0.5); font-size: 13px;">Foutmelding</span><br>
            <span style="color: #ef4444; font-size: 15px;">${data.error}</span>
          </td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 12px 0 0 0; border-top: 1px solid rgba(255, 255, 255, 0.05);">
            <span style="color: rgba(255, 255, 255, 0.5); font-size: 13px;">Status</span><br>
            ${statusBadge('down')}
          </td>
        </tr>
      </table>
    </div>
    
    <div style="text-align: center;">
      ${emailButton('Bekijk details', data.dashboardUrl)}
    </div>
    
    <p style="color: rgba(255, 255, 255, 0.4); font-size: 13px; text-align: center; margin: 24px 0 0 0;">
      We blijven je site monitoren en sturen een melding zodra deze weer online is.
    </p>
  `;
  
  return {
    subject: `🔴 ${data.siteName} is offline`,
    html: emailWrapper(content, `Je website ${data.siteName} is niet bereikbaar. Bekijk de details in je dashboard.`)
  };
}

// 5. Recovery Alert
export function recoveryAlertEmail(data: { 
  userName: string; 
  siteName: string; 
  siteUrl: string;
  downtimeDuration: string;
  recoveredAt: Date;
  dashboardUrl: string;
}): { subject: string; html: string } {
  const content = `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; width: 72px; height: 72px; background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.1)); border-radius: 50%; line-height: 72px; font-size: 32px;">
        ✅
      </div>
    </div>
    
    <h1 style="color: #22c55e; font-size: 28px; font-weight: 700; text-align: center; margin: 0 0 8px 0;">
      Site Weer Online!
    </h1>
    <p style="color: rgba(255, 255, 255, 0.6); font-size: 16px; text-align: center; margin: 0 0 32px 0;">
      Je website is hersteld en weer bereikbaar
    </p>
    
    <div style="background: rgba(0, 0, 0, 0.3); border-radius: 16px; padding: 24px; margin-bottom: 24px;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding: 8px 0;">
            <span style="color: rgba(255, 255, 255, 0.5); font-size: 13px;">Website</span><br>
            <span style="color: #ffffff; font-size: 16px; font-weight: 600;">${data.siteName}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-top: 1px solid rgba(255, 255, 255, 0.05);">
            <span style="color: rgba(255, 255, 255, 0.5); font-size: 13px;">URL</span><br>
            <a href="${data.siteUrl}" style="color: #22c55e; font-size: 15px; text-decoration: none;">${data.siteUrl}</a>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-top: 1px solid rgba(255, 255, 255, 0.05);">
            <span style="color: rgba(255, 255, 255, 0.5); font-size: 13px;">Downtime duur</span><br>
            <span style="color: #f59e0b; font-size: 15px; font-weight: 600;">${data.downtimeDuration}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-top: 1px solid rgba(255, 255, 255, 0.05);">
            <span style="color: rgba(255, 255, 255, 0.5); font-size: 13px;">Hersteld op</span><br>
            <span style="color: #ffffff; font-size: 15px;">${data.recoveredAt.toLocaleString('nl-NL', { dateStyle: 'long', timeStyle: 'short' })}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0 0 0; border-top: 1px solid rgba(255, 255, 255, 0.05);">
            <span style="color: rgba(255, 255, 255, 0.5); font-size: 13px;">Status</span><br>
            ${statusBadge('up')}
          </td>
        </tr>
      </table>
    </div>
    
    <div style="text-align: center;">
      ${emailButton('Bekijk rapport', data.dashboardUrl)}
    </div>
  `;
  
  return {
    subject: `✅ ${data.siteName} is weer online`,
    html: emailWrapper(content, `Goed nieuws! Je website ${data.siteName} is hersteld na ${data.downtimeDuration} downtime.`)
  };
}

// 6. SSL Certificate Warning
export function sslWarningEmail(data: { 
  userName: string; 
  siteName: string; 
  siteUrl: string;
  expiresAt: Date;
  daysRemaining: number;
  dashboardUrl: string;
}): { subject: string; html: string } {
  const urgency = data.daysRemaining <= 7 ? 'critical' : data.daysRemaining <= 14 ? 'warning' : 'info';
  const urgencyColor = urgency === 'critical' ? '#ef4444' : urgency === 'warning' ? '#f59e0b' : '#3b82f6';
  
  const content = `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; width: 72px; height: 72px; background: linear-gradient(135deg, ${urgencyColor}33, ${urgencyColor}1a); border-radius: 50%; line-height: 72px; font-size: 32px;">
        🔒
      </div>
    </div>
    
    <h1 style="color: ${urgencyColor}; font-size: 28px; font-weight: 700; text-align: center; margin: 0 0 8px 0;">
      SSL Certificaat Verloopt
    </h1>
    <p style="color: rgba(255, 255, 255, 0.6); font-size: 16px; text-align: center; margin: 0 0 32px 0;">
      Vernieuw je certificaat om beveiligingswaarschuwingen te voorkomen
    </p>
    
    <div style="background: ${urgencyColor}1a; border: 1px solid ${urgencyColor}33; border-radius: 16px; padding: 20px; margin-bottom: 24px; text-align: center;">
      <p style="color: ${urgencyColor}; font-size: 48px; font-weight: 700; margin: 0;">${data.daysRemaining}</p>
      <p style="color: ${urgencyColor}; font-size: 14px; margin: 8px 0 0 0; opacity: 0.8;">dagen resterend</p>
    </div>
    
    <div style="background: rgba(0, 0, 0, 0.3); border-radius: 16px; padding: 24px; margin-bottom: 24px;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding: 8px 0;">
            <span style="color: rgba(255, 255, 255, 0.5); font-size: 13px;">Website</span><br>
            <span style="color: #ffffff; font-size: 16px; font-weight: 600;">${data.siteName}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-top: 1px solid rgba(255, 255, 255, 0.05);">
            <span style="color: rgba(255, 255, 255, 0.5); font-size: 13px;">Domein</span><br>
            <span style="color: #22c55e; font-size: 15px;">${data.siteUrl}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-top: 1px solid rgba(255, 255, 255, 0.05);">
            <span style="color: rgba(255, 255, 255, 0.5); font-size: 13px;">Verloopt op</span><br>
            <span style="color: #ffffff; font-size: 15px;">${data.expiresAt.toLocaleDateString('nl-NL', { dateStyle: 'long' })}</span>
          </td>
        </tr>
      </table>
    </div>
    
    <div style="text-align: center;">
      ${emailButton('Bekijk SSL details', data.dashboardUrl)}
    </div>
    
    <p style="color: rgba(255, 255, 255, 0.4); font-size: 13px; text-align: center; margin: 24px 0 0 0;">
      💡 <strong>Tip:</strong> Gebruik Let's Encrypt voor gratis automatische SSL vernieuwing.
    </p>
  `;
  
  return {
    subject: `🔒 SSL certificaat ${data.siteName} verloopt over ${data.daysRemaining} dagen`,
    html: emailWrapper(content, `Je SSL certificaat voor ${data.siteName} verloopt over ${data.daysRemaining} dagen. Vernieuw het tijdig.`)
  };
}

// 7. Upgrade Confirmation / Payment Received
export function upgradeConfirmationEmail(data: { 
  userName: string;
  planName: string;
  amount: string;
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate: Date;
  invoiceUrl?: string;
  dashboardUrl: string;
}): { subject: string; html: string } {
  const content = `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; width: 72px; height: 72px; background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.1)); border-radius: 50%; line-height: 72px; font-size: 32px;">
        🚀
      </div>
    </div>
    
    <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; text-align: center; margin: 0 0 8px 0;">
      Welkom bij ${data.planName}!
    </h1>
    <p style="color: rgba(255, 255, 255, 0.6); font-size: 16px; text-align: center; margin: 0 0 32px 0;">
      Je upgrade is bevestigd. Bedankt voor je vertrouwen!
    </p>
    
    <div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.05)); border: 1px solid rgba(34, 197, 94, 0.2); border-radius: 16px; padding: 24px; margin-bottom: 24px;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding: 8px 0;">
            <span style="color: rgba(255, 255, 255, 0.5); font-size: 13px;">Plan</span><br>
            <span style="color: #22c55e; font-size: 20px; font-weight: 700;">${data.planName}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-top: 1px solid rgba(255, 255, 255, 0.05);">
            <span style="color: rgba(255, 255, 255, 0.5); font-size: 13px;">Bedrag</span><br>
            <span style="color: #ffffff; font-size: 16px; font-weight: 600;">${data.amount} / ${data.billingCycle === 'monthly' ? 'maand' : 'jaar'}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-top: 1px solid rgba(255, 255, 255, 0.05);">
            <span style="color: rgba(255, 255, 255, 0.5); font-size: 13px;">Volgende factuurdatum</span><br>
            <span style="color: #ffffff; font-size: 15px;">${data.nextBillingDate.toLocaleDateString('nl-NL', { dateStyle: 'long' })}</span>
          </td>
        </tr>
      </table>
    </div>
    
    <div style="background: rgba(0, 0, 0, 0.3); border-radius: 16px; padding: 24px; margin-bottom: 24px;">
      <h2 style="color: #ffffff; font-size: 16px; font-weight: 600; margin: 0 0 16px 0;">
        ✨ Wat is er nu mogelijk:
      </h2>
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding: 8px 0; color: rgba(255, 255, 255, 0.8); font-size: 14px;">
            <span style="color: #22c55e; margin-right: 8px;">✓</span> Meer websites monitoren
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: rgba(255, 255, 255, 0.8); font-size: 14px;">
            <span style="color: #22c55e; margin-right: 8px;">✓</span> Snellere check intervals
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: rgba(255, 255, 255, 0.8); font-size: 14px;">
            <span style="color: #22c55e; margin-right: 8px;">✓</span> Uitgebreide rapportages
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: rgba(255, 255, 255, 0.8); font-size: 14px;">
            <span style="color: #22c55e; margin-right: 8px;">✓</span> Priority support
          </td>
        </tr>
      </table>
    </div>
    
    <div style="text-align: center;">
      ${emailButton('Naar dashboard', data.dashboardUrl)}
      ${data.invoiceUrl ? emailButton('Download factuur', data.invoiceUrl, 'secondary') : ''}
    </div>
  `;
  
  return {
    subject: `🚀 Welkom bij ${data.planName}! Je upgrade is bevestigd`,
    html: emailWrapper(content, `Je upgrade naar ${data.planName} is bevestigd. Bedankt voor je vertrouwen!`)
  };
}

// 8. Weekly Report
export function weeklyReportEmail(data: {
  userName: string;
  weekNumber: number;
  totalSites: number;
  avgUptime: number;
  totalIncidents: number;
  topPerformer: { name: string; uptime: number };
  needsAttention?: { name: string; uptime: number };
  dashboardUrl: string;
}): { subject: string; html: string } {
  const content = `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; width: 72px; height: 72px; background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.1)); border-radius: 50%; line-height: 72px; font-size: 32px;">
        📊
      </div>
    </div>
    
    <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; text-align: center; margin: 0 0 8px 0;">
      Wekelijks Rapport
    </h1>
    <p style="color: rgba(255, 255, 255, 0.6); font-size: 16px; text-align: center; margin: 0 0 32px 0;">
      Week ${data.weekNumber} overzicht van je websites
    </p>
    
    <!-- Stats Grid -->
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
      <tr>
        <td width="33%" style="padding: 8px;">
          <div style="background: rgba(0, 0, 0, 0.3); border-radius: 12px; padding: 20px; text-align: center;">
            <p style="color: #22c55e; font-size: 32px; font-weight: 700; margin: 0;">${data.avgUptime.toFixed(2)}%</p>
            <p style="color: rgba(255, 255, 255, 0.5); font-size: 12px; margin: 8px 0 0 0;">Gem. Uptime</p>
          </div>
        </td>
        <td width="33%" style="padding: 8px;">
          <div style="background: rgba(0, 0, 0, 0.3); border-radius: 12px; padding: 20px; text-align: center;">
            <p style="color: #ffffff; font-size: 32px; font-weight: 700; margin: 0;">${data.totalSites}</p>
            <p style="color: rgba(255, 255, 255, 0.5); font-size: 12px; margin: 8px 0 0 0;">Sites</p>
          </div>
        </td>
        <td width="33%" style="padding: 8px;">
          <div style="background: rgba(0, 0, 0, 0.3); border-radius: 12px; padding: 20px; text-align: center;">
            <p style="color: ${data.totalIncidents > 0 ? '#f59e0b' : '#22c55e'}; font-size: 32px; font-weight: 700; margin: 0;">${data.totalIncidents}</p>
            <p style="color: rgba(255, 255, 255, 0.5); font-size: 12px; margin: 8px 0 0 0;">Incidenten</p>
          </div>
        </td>
      </tr>
    </table>
    
    <div style="background: rgba(0, 0, 0, 0.3); border-radius: 16px; padding: 24px; margin-bottom: 24px;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td>
                  <span style="color: rgba(255, 255, 255, 0.5); font-size: 13px;">🏆 Beste performer</span><br>
                  <span style="color: #ffffff; font-size: 15px; font-weight: 600;">${data.topPerformer.name}</span>
                </td>
                <td style="text-align: right;">
                  <span style="color: #22c55e; font-size: 16px; font-weight: 700;">${data.topPerformer.uptime}%</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        ${data.needsAttention ? `
        <tr>
          <td style="padding: 12px 0;">
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td>
                  <span style="color: rgba(255, 255, 255, 0.5); font-size: 13px;">⚠️ Aandacht nodig</span><br>
                  <span style="color: #ffffff; font-size: 15px; font-weight: 600;">${data.needsAttention.name}</span>
                </td>
                <td style="text-align: right;">
                  <span style="color: #f59e0b; font-size: 16px; font-weight: 700;">${data.needsAttention.uptime}%</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        ` : ''}
      </table>
    </div>
    
    <div style="text-align: center;">
      ${emailButton('Bekijk volledig rapport', data.dashboardUrl)}
    </div>
  `;
  
  return {
    subject: `📊 Week ${data.weekNumber}: ${data.avgUptime.toFixed(1)}% gemiddelde uptime`,
    html: emailWrapper(content, `Je wekelijks uptime rapport: ${data.avgUptime.toFixed(1)}% gemiddelde uptime over ${data.totalSites} sites.`)
  };
}
