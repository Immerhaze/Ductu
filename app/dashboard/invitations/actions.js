"use server";

import prisma from "@/lib/prisma";
import { createInviteToken } from "@/lib/invitations";
import { requireAppUser } from "@/lib/authz";

export async function createInvitation({
  email,
  role,
  positionTitle,

  // ✅ NUEVO
  studentCourseId = null,
  teacherCourseAssignments = [], // [{ courseId, isChief }]
}) {
  const { appUser: requester } = await requireAppUser({ roles: ["ADMINISTRATIVE"] });
  const institutionId = requester.institutionId;

  const normalizedRole = typeof role === "string" ? role.trim() : "";
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  const normalizedPositionTitle = typeof positionTitle === "string" ? positionTitle.trim() : "";

  if (!normalizedEmail) throw new Error("Email es obligatorio.");
  if (!normalizedRole) throw new Error("Rol es obligatorio.");

  if (normalizedRole === "ADMINISTRATIVE" && !normalizedPositionTitle) {
    throw new Error("El cargo es obligatorio para usuarios administrativos.");
  }

  // ✅ Validación por rol (según tu schema)
  if (normalizedRole === "STUDENT") {
    if (!studentCourseId) throw new Error("Debes asignar un curso al estudiante.");

    const course = await prisma.course.findFirst({
      where: { id: studentCourseId, institutionId, isActive: true },
      select: { id: true },
    });
    if (!course) throw new Error("Curso inválido para esta institución.");
  }

  if (normalizedRole === "TEACHER") {
    if (!Array.isArray(teacherCourseAssignments) || teacherCourseAssignments.length === 0) {
      throw new Error("Debes asignar al menos un curso al profesor.");
    }

    // shape + 1 jefe máximo
    const chiefs = teacherCourseAssignments.filter((a) => a?.isChief === true).length;
    if (chiefs > 1) throw new Error("Solo puedes marcar un (1) curso como jefe.");

    const courseIds = teacherCourseAssignments.map((a) => a.courseId);
    const uniqueCourseIds = [...new Set(courseIds)];
    if (uniqueCourseIds.length !== courseIds.length) {
      throw new Error("Cursos duplicados en la invitación.");
    }

    const validCourses = await prisma.course.findMany({
      where: { id: { in: uniqueCourseIds }, institutionId, isActive: true },
      select: { id: true },
    });

    if (validCourses.length !== uniqueCourseIds.length) {
      throw new Error("Uno o más cursos no pertenecen a la institución o no están activos.");
    }
  }


  const exists = await prisma.appUser.findFirst({
    where: { institutionId, email: normalizedEmail },
  });
  if (exists) throw new Error("Ese usuario ya existe en la institución.");

  const activeInvite = await prisma.invitation.findFirst({
    where: {
      institutionId,
      email: normalizedEmail,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    select: { id: true, expiresAt: true },
  });

  if (activeInvite) {
    throw new Error(
      `Ya existe una invitación activa para este correo. Expira el ${activeInvite.expiresAt.toLocaleDateString()}.`
    );
  }

  const { token, tokenHash } = createInviteToken();

  // ✅ IMPORTANTE: crear invitación + courseAssignments en transacción
  await prisma.$transaction(async (tx) => {
    const invitation = await tx.invitation.create({
      data: {
        institutionId,
        email: normalizedEmail,
        role: normalizedRole,
        positionTitle: normalizedRole === "ADMINISTRATIVE" ? normalizedPositionTitle : null,

        // ✅ STUDENT: aquí queda “guardado” el curso
        courseId: normalizedRole === "STUDENT" ? studentCourseId : null,

        tokenHash,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        createdByAppUserId: requester.id,
      },
      select: { id: true },
    });

    // ✅ TEACHER: pre-asignación de cursos (y jefatura)
    if (normalizedRole === "TEACHER") {
      await tx.invitationCourseAssignment.createMany({
        data: teacherCourseAssignments.map((a) => ({
          invitationId: invitation.id,
          courseId: a.courseId,
          institutionId,
          isChief: a.isChief,
        })),
        skipDuplicates: true,
      });
    }
  });

  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`;
  return { inviteUrl };
}


/**
 * Lista invitaciones "pendientes" usando tu modelo actual:
 * - Pendiente = no expirada (expiresAt > now)
 * (No asume status porque tu schema no lo muestra.)
 */
export async function listPendingInvitations() {
  // ✅ Autorización centralizada
  const { appUser: requester } = await requireAppUser({ roles: ["ADMINISTRATIVE"] });

  const institutionId = requester.institutionId;
  const now = new Date();

  const invitations = await prisma.invitation.findMany({
    where: {
      institutionId,
      usedAt: null,
      expiresAt: { gt: now },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      role: true,
      positionTitle: true,
      createdAt: true,
      expiresAt: true,
      createdByAppUserId: true,
    },
  });

  return invitations;
}

/**
 * Revoca invitación "expirándola" ahora mismo.
 * (Sin asumir campo status.)
 */
export async function revokeInvitation(invitationId) {
  if (!invitationId) {
    throw new Error("ID de invitación requerido.");
  }

  // ✅ Autorización centralizada
  const { appUser: requester } = await requireAppUser({
    roles: ["ADMINISTRATIVE"],
  });

  const institutionId = requester.institutionId;

  // 🔐 Verificar que la invitación pertenece a la institución
  const invitation = await prisma.invitation.findUnique({
    where: { id: invitationId },
    select: {
      id: true,
      institutionId: true,
      usedAt: true,
      expiresAt: true,
    },
  });

  if (!invitation || invitation.institutionId !== institutionId) {
    throw new Error("Invitación no encontrada.");
  }

  // 🚫 No permitir revocar si ya fue usada
  if (invitation.usedAt) {
    throw new Error("La invitación ya fue utilizada.");
  }

  // ⛔ Revocar = expirar inmediatamente
  await prisma.invitation.update({
    where: { id: invitationId },
    data: {
      expiresAt: new Date(),
    },
  });

  return { ok: true };
}
