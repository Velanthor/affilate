import nodemailer from "nodemailer";

/**
 * IONOS SMTP transport.
 * IONOS SMTP settings (as of writing): smtp.ionos.de, Port 587 (STARTTLS) or 465 (SSL).
 * Configure via .env — see .env.example.
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ionos.de",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const FROM = `"VELANTHOR Partner" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://velanthor.org";

function layout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title></head>
<body style="margin:0;padding:0;background-color:#050710;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#050710;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#0c1020;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">
        <tr><td style="padding:32px 40px 0 40px;">
          <div style="font-size:22px;font-weight:800;letter-spacing:-0.5px;background:linear-gradient(90deg,#5c81ff,#22d3ee);-webkit-background-clip:text;background-clip:text;color:#5c81ff;">VELANTHOR</div>
          <div style="height:1px;background:rgba(255,255,255,0.08);margin:24px 0;"></div>
        </td></tr>
        <tr><td style="padding:0 40px 32px 40px;color:#e2e8f0;font-size:15px;line-height:1.6;">
          ${body}
        </td></tr>
        <tr><td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.08);color:#64748b;font-size:12px;">
          © ${new Date().getFullYear()} VELANTHOR. Diese E-Mail wurde automatisch generiert.<br>
          <a href="${APP_URL}/impressum" style="color:#64748b;">Impressum</a> ·
          <a href="${APP_URL}/datenschutz" style="color:#64748b;">Datenschutz</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function button(url: string, label: string): string {
  return `<a href="${url}" style="display:inline-block;margin-top:20px;padding:12px 28px;background:linear-gradient(90deg,#3d5cff,#22d3ee);color:#fff;text-decoration:none;border-radius:10px;font-weight:600;font-size:14px;">${label}</a>`;
}

async function send(to: string, subject: string, html: string) {
  await transporter.sendMail({ from: FROM, to, subject, html });
}

export const mailer = {
  async sendVerificationEmail(to: string, firstName: string, token: string) {
    const url = `${APP_URL}/verify-email?token=${token}`;
    await send(
      to,
      "Bestätige deine E-Mail-Adresse — VELANTHOR Partnerprogramm",
      layout(
        "E-Mail bestätigen",
        `<h2 style="color:#fff;font-size:20px;margin:0 0 12px 0;">Hallo ${firstName},</h2>
         <p>willkommen im VELANTHOR Partnerprogramm! Bitte bestätige deine E-Mail-Adresse, um dein Konto zu aktivieren.</p>
         ${button(url, "E-Mail bestätigen")}
         <p style="margin-top:24px;color:#94a3b8;font-size:13px;">Falls du dich nicht registriert hast, ignoriere diese E-Mail einfach.</p>`
      )
    );
  },

  async sendWelcomeEmail(to: string, firstName: string, referralCode: string) {
    await send(
      to,
      "Willkommen bei VELANTHOR Partner",
      layout(
        "Willkommen",
        `<h2 style="color:#fff;font-size:20px;margin:0 0 12px 0;">Willkommen, ${firstName}!</h2>
         <p>Dein Affiliate-Konto ist aktiv. Dein persönlicher Referral-Link lautet:</p>
         <p style="background:rgba(255,255,255,0.05);padding:12px 16px;border-radius:8px;font-family:monospace;color:#22d3ee;">${APP_URL}/?ref=${referralCode}</p>
         ${button(`${APP_URL}/dashboard`, "Zum Dashboard")}`
      )
    );
  },

  async sendPasswordResetEmail(to: string, firstName: string, token: string) {
    const url = `${APP_URL}/reset-password?token=${token}`;
    await send(
      to,
      "Passwort zurücksetzen — VELANTHOR",
      layout(
        "Passwort zurücksetzen",
        `<h2 style="color:#fff;font-size:20px;margin:0 0 12px 0;">Hallo ${firstName},</h2>
         <p>wir haben eine Anfrage zum Zurücksetzen deines Passworts erhalten. Der Link ist 60 Minuten gültig.</p>
         ${button(url, "Passwort zurücksetzen")}
         <p style="margin-top:24px;color:#94a3b8;font-size:13px;">Falls du dies nicht angefordert hast, ignoriere diese E-Mail.</p>`
      )
    );
  },

  async sendNewConversionEmail(to: string, firstName: string, amount: string, commission: string) {
    await send(
      to,
      "Neue Conversion! 🎉 — VELANTHOR",
      layout(
        "Neue Conversion",
        `<h2 style="color:#fff;font-size:20px;margin:0 0 12px 0;">Glückwunsch, ${firstName}!</h2>
         <p>Du hast eine neue Conversion über deinen Referral-Link erzielt.</p>
         <p>Bestellwert: <strong style="color:#fff;">${amount}</strong><br>
         Deine Provision: <strong style="color:#10b981;">${commission}</strong></p>
         ${button(`${APP_URL}/dashboard`, "Details ansehen")}`
      )
    );
  },

  async sendPayoutRequestedEmail(to: string, firstName: string, amount: string) {
    await send(
      to,
      "Auszahlung beantragt — VELANTHOR",
      layout(
        "Auszahlung beantragt",
        `<p>Hallo ${firstName}, deine Auszahlungsanfrage über <strong style="color:#fff;">${amount}</strong> ist eingegangen und wird geprüft.</p>`
      )
    );
  },

  async sendPayoutApprovedEmail(to: string, firstName: string, amount: string) {
    await send(
      to,
      "Auszahlung genehmigt — VELANTHOR",
      layout(
        "Auszahlung genehmigt",
        `<p>Hallo ${firstName}, deine Auszahlung über <strong style="color:#10b981;">${amount}</strong> wurde genehmigt und wird in Kürze überwiesen.</p>`
      )
    );
  },

  async sendAdminNewAffiliateNotification(to: string, name: string, email: string) {
    await send(
      to,
      "Neue Affiliate-Registrierung — VELANTHOR",
      layout(
        "Neue Registrierung",
        `<p>Ein neuer Affiliate hat sich registriert:</p>
         <p><strong style="color:#fff;">${name}</strong><br>${email}</p>
         ${button(`${APP_URL}/admin/affiliates`, "Im Admin-Panel öffnen")}`
      )
    );
  },
};
