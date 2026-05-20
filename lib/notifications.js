// lib/notifications.js
import prisma from "@/lib/prisma";
import { sendNotificationEmail } from "@/lib/email/sendNotificationEmail";

/**
 * Crea notificaciones en DB y opcionalmente envía email
 * @param {Array} recipients - [{ userId, email, fullName }]
 * @param {{ type, title, body, link }} payload
 * @param {{ sendEmail?: boolean }} opts
 */
export async function createNotifications(recipients, payload, opts = {}) {
  if (!recipients?.length) return;

  const { type, title, body, link } = payload;
  const { sendEmail = true } = opts;

  // Obtener institutionId del primer recipient
  const firstUser = await prisma.appUser.findUnique({
    where: { id: recipients[0].userId },
    select: { institutionId: true },
  });

  if (!firstUser?.institutionId) return;

  // Crear todas las notificaciones en batch
  await prisma.notification.createMany({
    data: recipients.map((r) => ({
      userId:        r.userId,
      institutionId: firstUser.institutionId,
      type,
      title,
      body:  body ?? null,
      link:  link ?? null,
      isRead: false,
    })),
    skipDuplicates: false,
  });

  // Enviar emails en background (no bloqueante)
  if (sendEmail) {
    const emailPromises = recipients.map((r) =>
      sendNotificationEmail({
        to:       r.email,
        name:     r.fullName ?? r.email,
        title,
        body:     body ?? "",
        link,
      }).catch((e) => console.error("[notifications] email error:", e?.message))
    );
    // Fire and forget
    Promise.allSettled(emailPromises);
  }
}