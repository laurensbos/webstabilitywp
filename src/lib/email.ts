import nodemailer from 'nodemailer';

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

async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.SMTP_PASS) {
    console.log('SMTP not configured, skipping email:', subject);
    return { success: false, error: 'SMTP not configured' };
  }

  try {
    await transporter.sendMail({
      from: '"Web Stability" <info@webstability.nl>',
      to,
      subject,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}

export async function sendAlertEmail(
  to: string,
  subject: string,
  siteName: string,
  alertType: string,
  message: string
) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0f0d; color: #fff; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; }
          .content { background: #141918; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid rgba(255,255,255,0.1); }
          .alert-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
          .alert-critical { background: rgba(239,68,68,0.2); color: #ef4444; }
          .alert-warning { background: rgba(245,158,11,0.2); color: #f59e0b; }
          .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">⚡ Web Stability Alert</h1>
          </div>
          <div class="content">
            <p><strong>Site:</strong> ${siteName}</p>
            <p><span class="alert-badge alert-${alertType === 'downtime' ? 'critical' : 'warning'}">${alertType.toUpperCase()}</span></p>
            <p style="color: #94a3b8;">${message}</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">View Dashboard →</a>
          </div>
        </div>
      </body>
    </html>
  `;
  
  return sendEmail(to, subject, html);
}

export async function sendWelcomeEmail(to: string, name: string) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0f0d; color: #fff; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
          .content { background: #141918; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid rgba(255,255,255,0.1); }
          .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">Welkom, ${name}! 👋</h1>
            <p style="margin: 10px 0 0; opacity: 0.9;">Je website monitoring is bijna klaar</p>
          </div>
          <div class="content">
            <h2 style="color: #fff;">Aan de slag in 3 stappen:</h2>
            
            <div style="margin: 20px 0; padding-left: 45px; position: relative;">
              <div style="position: absolute; left: 0; top: 0; background: #10b981; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">1</div>
              <strong style="color: #fff;">Voeg je eerste site toe</strong>
              <p style="color: #94a3b8; margin: 5px 0 0;">Vul de URL in en wij beginnen direct met monitoren.</p>
            </div>
            
            <div style="margin: 20px 0; padding-left: 45px; position: relative;">
              <div style="position: absolute; left: 0; top: 0; background: #10b981; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">2</div>
              <strong style="color: #fff;">Configureer je alerts</strong>
              <p style="color: #94a3b8; margin: 5px 0 0;">Kies hoe je gewaarschuwd wilt worden.</p>
            </div>
            
            <div style="margin: 20px 0; padding-left: 45px; position: relative;">
              <div style="position: absolute; left: 0; top: 0; background: #10b981; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">3</div>
              <strong style="color: #fff;">Relax</strong>
              <p style="color: #94a3b8; margin: 5px 0 0;">Wij houden alles in de gaten terwijl jij slaapt.</p>
            </div>
            
            <center>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">Naar Dashboard →</a>
            </center>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail(to, 'Welkom bij Web Stability! 🎉', html);
}

export async function sendDowntimeAlert(to: string, siteName: string, siteUrl: string, isDown: boolean, error?: string) {
  const subject = isDown 
    ? `🚨 ALERT: ${siteName} is offline!`
    : `✅ RECOVERED: ${siteName} is weer online`;
  
  const message = isDown
    ? `Je website ${siteUrl} is offline gegaan.${error ? ` Fout: ${error}` : ''}`
    : `Je website ${siteUrl} is weer online en bereikbaar.`;

  return sendAlertEmail(to, subject, siteName, isDown ? 'downtime' : 'recovery', message);
}
