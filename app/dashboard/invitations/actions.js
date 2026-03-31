"use server";

import prisma from "@/lib/prisma";
import { createInviteToken } from "@/lib/invitations";
import { requireAppUser } from "@/lib/authz";
import { sendInvitationEmail } from "@/lib/email/sendInvitationEmail";

export async function createInvitation({
  email,
  role,
  positionTitle = "",
  studentCourseId = null,
  teacherCourseAssignments = [], // [{ courseId, subjectId, isChief }]
}) {
  const { appUser: requester } = await requireAppUser({ roles: ["ADMINISTRATIVE"] });
  const institutionId = requester.institutionId;

  const normalizedEmail = String(email ?? "").trim().toLowerCase();
  const normalizedRole = String(role ?? "").trim();
  const normalizedPositionTitle = String(positionTitle ?? "").trim();

  if (!normalizedEmail) throw new Error("Email es obligatorio.");
  if (!normalizedRole) throw new Error("Rol es obligatorio.");

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

    const chiefs = teacherCourseAssignments.filter((a) => a?.isChief === true).length;
    if (chiefs > 1) throw new Error("Solo puedes marcar un (1) curso como jefe.");

    // Validar que cada asignación tenga subjectId
    const missingSubject = teacherCourseAssignments.find((a) => !a.subjectId);
    if (missingSubject) throw new Error("Debes asignar una asignatura a cada curso del docente.");

    const courseIds = teacherCourseAssignments.map((a) => a.courseId);
    const uniqueIds = [...new Set(courseIds)];
    if (uniqueIds.length !== courseIds.length) throw new Error("Cursos duplicados en la invitación.");

    const validCourses = await prisma.course.findMany({
      where: { id: { in: uniqueIds }, institutionId, isActive: true },
      select: { id: true },
    });
    if (validCourses.length !== uniqueIds.length) {
      throw new Error("Uno o más cursos no pertenecen a la institución o no están activos.");
    }

    // Validar que las asignaturas existan
    const subjectIds = [...new Set(teacherCourseAssignments.map((a) => a.subjectId))];
    const validSubjects = await prisma.subject.findMany({
      where: { id: { in: subjectIds }, institutionId, isActive: true },
      select: { id: true },
    });
    if (validSubjects.length !== subjectIds.length) {
      throw new Error("Una o más asignaturas no pertenecen a la institución.");
    }
  }

  const exists = await prisma.appUser.findFirst({
    where: { institutionId, email: normalizedEmail },
    select: { id: true },
  });
  if (exists) throw new Error("Ese usuario ya existe en la institución.");

  const activeInvite = await prisma.invitation.findFirst({
    where: { institutionId, email: normalizedEmail, usedAt: null, expiresAt: { gt: new Date() } },
    select: { id: true, expiresAt: true },
  });
  if (activeInvite) {
    throw new Error(
      `Ya existe una invitación activa para este correo. Expira el ${activeInvite.expiresAt.toLocaleDateString("es-CL")}.`
    );
  }

  const institution = await prisma.institution.findUnique({
    where: { id: institutionId },
    select: { name: true },
  });

  const { token, tokenHash } = createInviteToken();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

  await prisma.$transaction(async (tx) => {
    const invitation = await tx.invitation.create({
      data: {
        institutionId,
        email: normalizedEmail,
        role: normalizedRole,
        positionTitle: normalizedPositionTitle || null,
        courseId: normalizedRole === "STUDENT" ? studentCourseId : null,
        tokenHash,
        expiresAt,
        createdByAppUserId: requester.id,
      },
      select: { id: true },
    });

    if (normalizedRole === "TEACHER") {
      await tx.invitationCourseAssignment.createMany({
        data: teacherCourseAssignments.map((a) => ({
          invitationId: invitation.id,
          courseId: a.courseId,
          subjectId: a.subjectId,
          institutionId,
          isChief: a.isChief,
        })),
        skipDuplicates: true,
      });
    }
  });

  await sendInvitationEmail({
    to: normalizedEmail,
    token,
    institutionName: institution?.name ?? "tu institución",
    role: normalizedRole,
    expiresAt,
  });

  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/invite/${token}`;
  return { inviteUrl };
}

export async function listPendingInvitations() {
  const { appUser: requester } = await requireAppUser({ roles: ["ADMINISTRATIVE"] });
  const institutionId = requester.institutionId;

  return prisma.invitation.findMany({
    where: { institutionId, usedAt: null, expiresAt: { gt: new Date() } },
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
}

export async function revokeInvitation(invitationId) {
  if (!invitationId) throw new Error("ID de invitación requerido.");

  const { appUser: requester } = await requireAppUser({ roles: ["ADMINISTRATIVE"] });
  const institutionId = requester.institutionId;

  const invitation = await prisma.invitation.findUnique({
    where: { id: invitationId },
    select: { id: true, institutionId: true, usedAt: true },
  });

  if (!invitation || invitation.institutionId !== institutionId) {
    throw new Error("Invitación no encontrada.");
  }
  if (invitation.usedAt) throw new Error("La invitación ya fue utilizada.");

  await prisma.invitation.update({
    where: { id: invitationId },
    data: { expiresAt: new Date() },
  });

  return { ok: true };
}