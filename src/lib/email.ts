import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

interface AlertEmailData {
  to: string
  siteName: string
  siteUrl: string
  status: 'down' | 'up'
  error?: string
  responseTime?: number
  timestamp: number
}

export async function sendDowntimeAlert(data: AlertEmailData) {
  const isDown = data.status === 'down'
  
  const subject = isDown 
    ? `�� ALERT: ${data.siteName} is offline!`
    : `✅ RECOVERED: ${data.siteName} is weer online`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #0a0f0d; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0f0d; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(180deg, #141918 0%, #0f1412 100%); border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); overflow: hidden;">
              <!-- Header -->
              <tr>
                <td style="padding: 32px 40px; border-bottom: 1px solid rgba(255,255,255,0.06);">
                  <table width="100%">
                    <tr>
                      <td>
                        <span style="font-size: 24px; font-weight: 700; color: #ffffff;">webstability</span>
                      </td>
                      <td align="right">
                        <span style="background: ${isDown ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}; color: ${isDown ? '#f87171' : '#4ade80'}; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                          ${isDown ? '🔴 OFFLINE' : '✅ ONLINE'}
                        </span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Alert Icon -->
              <tr>
                <td align="center" style="padding: 40px 40px 20px;">
                  <div style="width: 80px; height: 80px; background: ${isDown ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                    <span style="font-size: 40px;">${isDown ? '⚠️' : '✅'}</span>
                  </div>
                </td>
              </tr>
              
              <!-- Title -->
              <tr>
                <td align="center" style="padding: 0 40px 20px;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                    ${isDown ? 'Website is offline!' : 'Website is hersteld!'}
                  </h1>
                </td>
              </tr>
              
              <!-- Site Info -->
              <tr>
                <td style="padding: 0 40px 30px;">
                  <table width="100%" style="background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid rgba(255,255,255,0.06);">
                    <tr>
                      <td style="padding: 20px;">
                        <table width="100%">
                          <tr>
                            <td style="color: rgba(255,255,255,0.5); font-size: 12px; text-transform: uppercase; padding-bottom: 6px;">Website</td>
                          </tr>
                          <tr>
                            <td style="color: #ffffff; font-size: 18px; font-weight: 600;">${data.siteName}</td>
                          </tr>
                          <tr>
                            <td style="padding-top: 4px;">
                              <a href="${data.siteUrl}" style="color: #00e599; font-size: 14px; text-decoration: none;">${data.siteUrl}</a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 0 20px 20px;">
                        <table width="100%" cellspacing="10">
                          <tr>
                            <td width="50%" style="background: rgba(255,255,255,0.03); border-radius: 8px; padding: 12px;">
                              <div style="color: rgba(255,255,255,0.5); font-size: 11px; text-transform: uppercase;">Tijdstip</div>
                              <div style="color: #ffffff; font-size: 14px; font-weight: 500; margin-top: 4px;">
                                ${new Date(data.timestamp).toLocaleString('nl-NL', { 
                                  day: '2-digit', 
                                  month: 'short', 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </div>
                            </td>
                            <td width="50%" style="background: rgba(255,255,255,0.03); border-radius: 8px; padding: 12px;">
                              <div style="color: rgba(255,255,255,0.5); font-size: 11px; text-transform: uppercase;">
                                ${isDown ? 'Fout' : 'Responstijd'}
                              </div>
                              <div style="color: ${isDown ? '#f87171' : '#ffffff'}; font-size: 14px; font-weight: 500; margin-top: 4px;">
                                ${isDown ? (data.error || 'Timeout') : `${data.responseTime || 0}ms`}
                              </div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- CTA Button -->
              <tr>
                <td align="center" style="padding: 0 40px 40px;">
                  <a href="https://webstabilitywp.vercel.app/dashboard" 
                     style="display: inline-block; background: linear-gradient(135deg, #00e599 0%, #00cc88 100%); color: #000000; font-size: 14px; font-weight: 600; padding: 14px 32px; border-radius: 10px; text-decoration: none;">
                    Bekijk Dashboard →
                  </a>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 24px 40px; border-top: 1px solid rgba(255,255,255,0.06); background: rgba(0,0,0,0.2);">
                  <table width="100%">
                    <tr>
                      <td style="color: rgba(255,255,255,0.4); font-size: 12px;">
                        Je ontvangt deze email omdat je alerts hebt ingeschakeld voor ${data.siteName}.
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-top: 8px;">
                        <a href="https://webstabilitywp.vercel.app/dashboard/settings" style="color: rgba(255,255,255,0.4); font-size: 12px; text-decoration: none;">
                          Alert instellingen aanpassen
                        </a>
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
  `

  try {
    await transporter.sendMail({
      from: '"Webstability" <info@webstability.nl>',
      to: data.to,
      subject,
      html,
    })
    console.log(`Alert email sent to ${data.to} for ${data.siteName}`)
    return true
  } catch (error) {
    console.error('Failed to send alert email:', error)
    return false
  }
}

export async function sendSSLExpiryWarning(data: {
  to: string
  siteName: string
  siteUrl: string
  expiryDate: Date
  daysUntilExpiry: number
}) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #0a0f0d; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0f0d; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(180deg, #141918 0%, #0f1412 100%); border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); overflow: hidden;">
              <tr>
                <td style="padding: 32px 40px; border-bottom: 1px solid rgba(255,255,255,0.06);">
                  <span style="font-size: 24px; font-weight: 700; color: #ffffff;">webstability</span>
                </td>
              </tr>
              <tr>
                <td align="center" style="padding: 40px;">
                  <div style="font-size: 40px; margin-bottom: 20px;">🔒</div>
                  <h1 style="margin: 0 0 16px; color: #ffffff; font-size: 24px;">SSL Certificaat Verloopt Binnenkort</h1>
                  <p style="color: rgba(255,255,255,0.6); margin: 0 0 24px;">
                    Het SSL certificaat van <strong style="color: #00e599;">${data.siteName}</strong> verloopt over <strong style="color: #fbbf24;">${data.daysUntilExpiry} dagen</strong>.
                  </p>
                  <table style="background: rgba(251,191,36,0.1); border: 1px solid rgba(251,191,36,0.3); border-radius: 12px; padding: 20px;">
                    <tr>
                      <td style="color: rgba(255,255,255,0.5); font-size: 12px;">Vervaldatum:</td>
                      <td style="color: #fbbf24; font-weight: 600; padding-left: 12px;">
                        ${data.expiryDate.toLocaleDateString('nl-NL', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </td>
                    </tr>
                  </table>
                  <div style="margin-top: 24px;">
                    <a href="${data.siteUrl}" style="color: #00e599; text-decoration: none;">${data.siteUrl}</a>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding: 24px 40px; border-top: 1px solid rgba(255,255,255,0.06); background: rgba(0,0,0,0.2);">
                  <span style="color: rgba(255,255,255,0.4); font-size: 12px;">
                    Vernieuw je SSL certificaat om te voorkomen dat bezoekers waarschuwingen zien.
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `

  try {
    await transporter.sendMail({
      from: '"Webstability" <info@webstability.nl>',
      to: data.to,
      subject: `⚠️ SSL Certificaat ${data.siteName} verloopt over ${data.daysUntilExpiry} dagen`,
      html,
    })
    return true
  } catch (error) {
    console.error('Failed to send SSL warning:', error)
    return false
  }
}

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.NEXTAUTH_URL || 'https://webstabilitywp.vercel.app'}/verify?token=${token}`
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #0a0f0d; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0f0d; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(180deg, #141918 0%, #0f1412 100%); border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); overflow: hidden;">
              <!-- Header -->
              <tr>
                <td style="padding: 32px 40px; border-bottom: 1px solid rgba(255,255,255,0.06);">
                  <span style="font-size: 24px; font-weight: 700; color: #ffffff;">webstability</span>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <h1 style="margin: 0 0 16px; color: #ffffff; font-size: 24px; font-weight: 600;">
                    Verifieer je email
                  </h1>
                  <p style="color: rgba(255,255,255,0.7); font-size: 16px; line-height: 1.6; margin: 0 0 32px;">
                    Bedankt voor je registratie! Klik op de knop hieronder om je email te verifiëren en je account te activeren.
                  </p>
                  
                  <a href="${verifyUrl}" 
                     style="display: inline-block; background: linear-gradient(135deg, #00e599 0%, #00cc88 100%); color: #000000; font-size: 16px; font-weight: 600; padding: 16px 32px; border-radius: 10px; text-decoration: none;">
                    Verifieer mijn email →
                  </a>
                  
                  <p style="color: rgba(255,255,255,0.5); font-size: 14px; margin: 32px 0 0;">
                    Of kopieer deze link naar je browser:<br>
                    <a href="${verifyUrl}" style="color: #00e599; word-break: break-all;">${verifyUrl}</a>
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 24px 40px; border-top: 1px solid rgba(255,255,255,0.06); background: rgba(0,0,0,0.2);">
                  <p style="color: rgba(255,255,255,0.4); font-size: 12px; margin: 0;">
                    Deze link is 24 uur geldig. Als je geen account hebt aangemaakt, kun je deze email negeren.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `

  try {
    await transporter.sendMail({
      from: '"Webstability" <info@webstability.nl>',
      to: email,
      subject: 'Verifieer je email - Webstability',
      html,
    })
    return true
  } catch (error) {
    console.error('Failed to send verification email:', error)
    return false
  }
}
