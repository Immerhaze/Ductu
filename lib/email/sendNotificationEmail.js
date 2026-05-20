// lib/email/sendNotificationEmail.js
import { resend, FROM_EMAIL } from "./resend";

export async function sendNotificationEmail({ to, name, title, body, link }) {
  if (!to) return;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const fullLink = link ? `${appUrl}${link}` : appUrl;

  await resend.emails.send({
    from:    FROM_EMAIL,
    to:      process.env.NODE_ENV === "production" ? to : (process.env.RESEND_DEV_REDIRECT_TO ?? to),
    subject: title,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: sans-serif; background: #f7f7f5; padding: 40px 0; margin: 0;">
          <div style="max-width: 520px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; border: 1px solid #e8e8e3;">
            <div style="background: #0f172a; padding: 24px 32px;">
              <h1 style="color: white; font-size: 20px; font-weight: 700; margin: 0; letter-spacing: 0.1em;">DUCTU</h1>
            </div>
            <div style="padding: 32px;">
              <p style="color: #888; font-size: 13px; margin: 0 0 8px;">Hola, ${name}</p>
              <h2 style="color: #1a1a1a; font-size: 18px; font-weight: 600; margin: 0 0 16px;">${title}</h2>
              ${body ? `<p style="color: #555; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">${body}</p>` : ""}
              ${link ? `
                <a href="${fullLink}" style="display: inline-block; background: #0f172a; color: white; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-size: 14px; font-weight: 500;">
                  Ver en DUCTU →
                </a>
              ` : ""}
            </div>
            <div style="border-top: 1px solid #f0f0ec; padding: 16px 32px; text-align: center;">
              <p style="color: #bbb; font-size: 12px; margin: 0;">© DUCTU · Plataforma educativa</p>
            </div>
          </div>
        </body>
      </html>
    `,
  });
}