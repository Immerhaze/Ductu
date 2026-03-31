// lib/email/sendInvitationEmail.js
import { resend, FROM_EMAIL } from "./resend";

const ROLE_LABEL = {
  ADMINISTRATIVE: "Administrativo",
  TEACHER: "Docente",
  STUDENT: "Estudiante",
};

function formatExpiry(date) {
  return new Date(date).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function buildInviteUrl(token) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base}/api/invite/${token}`;
}

function buildHtml({ to, institutionName, role, inviteUrl, expiresAt }) {
  const roleLabel = ROLE_LABEL[role] ?? role;
  const expiry = formatExpiry(expiresAt);

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Invitación a ${institutionName}</title>
</head>
<body style="margin:0;padding:0;background:#EDEEF2;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">

  <!-- Preheader oculto -->
  <span style="display:none;max-height:0;overflow:hidden;">
    Tienes una invitación para unirte a ${institutionName} como ${roleLabel}.
  </span>

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#EDEEF2;padding:48px 0;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" role="presentation" style="max-width:580px;width:100%;">

          <!-- Logo / Brand bar -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <table cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="background:#0D1B3E;border-radius:12px;padding:12px 28px;">
                    <span style="font-size:20px;font-weight:800;color:#ffffff;letter-spacing:0.18em;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">DUCTU</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main card -->
          <tr>
            <td style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

              <!-- Card header accent -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="background:linear-gradient(135deg,#1a3a6e 0%,#3b5bdb 100%);padding:40px 48px 36px;">
                    <p style="margin:0 0 10px;font-size:12px;font-weight:700;color:#a5b4fc;letter-spacing:0.14em;text-transform:uppercase;">
                      Invitación a la plataforma
                    </p>
                    <h1 style="margin:0;font-size:26px;font-weight:700;color:#ffffff;line-height:1.3;">
                      Te invitaron a unirte a<br/>${institutionName}
                    </h1>
                  </td>
                </tr>
              </table>

              <!-- Body -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="padding:40px 48px 36px;">

                    <p style="margin:0 0 28px;font-size:15px;color:#4a4a5a;line-height:1.75;">
                      Has sido invitado a crear tu cuenta en <strong style="color:#1a1a2e;">${institutionName}</strong>.
                      Haz clic en el botón para completar tu registro y comenzar a usar la plataforma.
                    </p>

                    <!-- Info pills -->
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:36px;">
                      <tr>
                        <td width="50%" style="padding-right:8px;">
                          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                            <tr>
                              <td style="background:#F4F6FF;border-radius:12px;padding:16px 20px;border:1px solid #E0E5FF;">
                                <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#7b8ec8;letter-spacing:0.1em;text-transform:uppercase;">Institución</p>
                                <p style="margin:0;font-size:14px;font-weight:700;color:#1a1a2e;">${institutionName}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                        <td width="50%" style="padding-left:8px;">
                          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                            <tr>
                              <td style="background:#F4F6FF;border-radius:12px;padding:16px 20px;border:1px solid #E0E5FF;">
                                <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#7b8ec8;letter-spacing:0.1em;text-transform:uppercase;">Tu rol</p>
                                <p style="margin:0;font-size:14px;font-weight:700;color:#1a1a2e;">${roleLabel}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    <!-- CTA Button -->
                    <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto 36px;">
                      <tr>
                        <td align="center" style="background:#3b5bdb;border-radius:12px;">
                          <a href="${inviteUrl}"
                             style="display:inline-block;padding:16px 48px;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:0.02em;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
                            Aceptar invitación &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- Expiry notice -->
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td style="background:#FFFBEB;border-radius:12px;padding:16px 20px;border:1px solid #FDE68A;">
                          <table cellpadding="0" cellspacing="0" role="presentation">
                            <tr>
                              <td style="padding-right:12px;vertical-align:top;font-size:18px;line-height:1;">⏳</td>
                              <td>
                                <p style="margin:0;font-size:13px;color:#92400E;line-height:1.6;">
                                  <strong>Este enlace expira el ${expiry}.</strong><br/>
                                  Si no lo usas antes de esa fecha, deberás solicitar una nueva invitación a tu institución.
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

              <!-- Divider -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="padding:0 48px;">
                    <div style="height:1px;background:#F0F0F5;"></div>
                  </td>
                </tr>
              </table>

              <!-- Link fallback -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="padding:24px 48px 40px;">
                    <p style="margin:0 0 8px;font-size:12px;color:#9090a0;">
                      Si el botón no funciona, copia y pega este enlace en tu navegador:
                    </p>
                    <a href="${inviteUrl}"
                       style="font-size:12px;color:#3b5bdb;word-break:break-all;text-decoration:none;">
                      ${inviteUrl}
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:28px 0 0;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td align="center" style="padding-bottom:8px;">
                    <p style="margin:0;font-size:12px;color:#9090a0;">
                      Este mensaje fue enviado automáticamente por <strong style="color:#6070a0;">DUCTU</strong> · Plataforma Educativa
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <p style="margin:0;font-size:11px;color:#b0b0c0;">
                      No respondas este correo · Si no esperabas esta invitación puedes ignorarlo
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
</html>`.trim();
}

export async function sendInvitationEmail({ to, token, institutionName, role, expiresAt }) {
  const inviteUrl = buildInviteUrl(token);

  const recipient =
    process.env.NODE_ENV === "development" && process.env.RESEND_DEV_REDIRECT_TO
      ? process.env.RESEND_DEV_REDIRECT_TO
      : to;

  const isDev = process.env.NODE_ENV === "development";

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: recipient,
    subject: isDev
      ? `[DEV → ${to}] Invitación a ${institutionName}`
      : `Te invitaron a unirte a ${institutionName} en DUCTU`,
    html: buildHtml({ to, institutionName, role, inviteUrl, expiresAt }),
  });

  if (error) {
    console.error("[sendInvitationEmail] Resend error:", error);
    throw new Error(`No se pudo enviar el email a ${to}: ${error.message}`);
  }
}