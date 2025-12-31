import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true, // true for 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.NEXTAUTH_URL}/verify?token=${token}`
  
  await transporter.sendMail({
    from: `"Webstability" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Verify your Webstability account",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0f0d; color: #fff; padding: 40px; }
            .container { max-width: 500px; margin: 0 auto; background: #111816; border-radius: 16px; padding: 40px; }
            .logo { color: #00e599; font-size: 24px; font-weight: bold; margin-bottom: 24px; }
            h1 { font-size: 22px; margin-bottom: 16px; }
            p { color: #888; line-height: 1.6; margin-bottom: 24px; }
            .button { display: inline-block; background: #00e599; color: #000 !important; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; }
            .footer { margin-top: 32px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">⚡ Webstability</div>
            <h1>Verify your email</h1>
            <p>Thanks for signing up! Please click the button below to verify your email address and activate your account.</p>
            <a href="${verifyUrl}" class="button">Verify Email</a>
            <p class="footer">If you didn't create an account, you can safely ignore this email.</p>
          </div>
        </body>
      </html>
    `,
  })
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`
  
  await transporter.sendMail({
    from: `"Webstability" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Reset your Webstability password",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0f0d; color: #fff; padding: 40px; }
            .container { max-width: 500px; margin: 0 auto; background: #111816; border-radius: 16px; padding: 40px; }
            .logo { color: #00e599; font-size: 24px; font-weight: bold; margin-bottom: 24px; }
            h1 { font-size: 22px; margin-bottom: 16px; }
            p { color: #888; line-height: 1.6; margin-bottom: 24px; }
            .button { display: inline-block; background: #00e599; color: #000 !important; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; }
            .footer { margin-top: 32px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">⚡ Webstability</div>
            <h1>Reset your password</h1>
            <p>We received a request to reset your password. Click the button below to choose a new password.</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <p class="footer">This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
          </div>
        </body>
      </html>
    `,
  })
}

export async function sendAlertEmail(email: string, siteName: string, siteUrl: string, status: 'down' | 'up') {
  const subject = status === 'down' 
    ? `🔴 Alert: ${siteName} is DOWN`
    : `🟢 Resolved: ${siteName} is back UP`
  
  await transporter.sendMail({
    from: `"Webstability Alerts" <${process.env.SMTP_USER}>`,
    to: email,
    subject,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0f0d; color: #fff; padding: 40px; }
            .container { max-width: 500px; margin: 0 auto; background: #111816; border-radius: 16px; padding: 40px; }
            .logo { color: #00e599; font-size: 24px; font-weight: bold; margin-bottom: 24px; }
            .status-down { color: #ef4444; font-size: 48px; }
            .status-up { color: #22c55e; font-size: 48px; }
            h1 { font-size: 22px; margin-bottom: 8px; }
            .url { color: #666; font-size: 14px; margin-bottom: 24px; }
            p { color: #888; line-height: 1.6; }
            .time { color: #00e599; font-weight: 600; }
            .button { display: inline-block; background: #00e599; color: #000 !important; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 24px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">⚡ Webstability</div>
            <div class="${status === 'down' ? 'status-down' : 'status-up'}">${status === 'down' ? '🔴' : '🟢'}</div>
            <h1>${siteName} is ${status === 'down' ? 'DOWN' : 'back UP'}</h1>
            <p class="url">${siteUrl}</p>
            <p>Detected at <span class="time">${new Date().toLocaleString()}</span></p>
            <a href="${process.env.NEXTAUTH_URL}/dashboard" class="button">View Dashboard</a>
          </div>
        </body>
      </html>
    `,
  })
}
