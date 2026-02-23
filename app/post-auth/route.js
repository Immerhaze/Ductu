// app/post-auth/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { stackServerApp } from "@/stack/server";
import { hashToken } from "@/lib/invitations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function redirectTo(path, req, { clearInvite = false } = {}) {
  const res = NextResponse.redirect(new URL(path, req.url));
  if (clearInvite) res.cookies.set("invite_token", "", { path: "/", maxAge: 0 });
  return res;
}

function plain200(message, { clearInvite = false } = {}) {
  const res = new NextResponse(message, { status: 200 });
  if (clearInvite) res.cookies.set("invite_token", "", { path: "/", maxAge: 0 });
  return res;
}

export async function GET(req) {
  const authUser = await stackServerApp.getUser({ or: "redirect" });
  const email = authUser.primaryEmail?.toLowerCase() ?? null;

  if (!email) return redirectTo("/auth?mode=login", req);

  const appUser = await prisma.appUser.findUnique({
    where: { authUserId: authUser.id },
    select: { id: true, profileCompletedAt: true, institutionId: true, isActive: true },
  });

  if (appUser) {
    if (!appUser.isActive) return redirectTo("/auth?mode=login", req);
    if (!appUser.profileCompletedAt) return redirectTo("/complete-profile", req);
    return redirectTo("/dashboard", req);
  }

  const cookieStore = await cookies();
  const inviteToken = cookieStore.get("invite_token")?.value;

  const institutionsCount = await prisma.institution.count();

  if (!inviteToken) {
    if (institutionsCount === 0) return redirectTo("/onboarding", req, { clearInvite: true });
    return redirectTo("/access-denied", req, { clearInvite: true });
  }

  const tokenHash = hashToken(inviteToken);

  // ✅ TRAER courseId + courseAssignments
   const invite = await prisma.invitation.findUnique({
    where: { tokenHash },
    select: {
      id: true,
      email: true,
      role: true,
      institutionId: true,
      usedAt: true,
      expiresAt: true,

      // ✅ para STUDENT
      courseId: true,

      // ✅ para TEACHER
      courseAssignments: {
        select: { courseId: true, isChief: true, institutionId: true },
      },
    },
  });

  const inviteValid =
    invite &&
    !invite.usedAt &&
    invite.expiresAt >= new Date() &&
    invite.email.toLowerCase() === email;

  if (!inviteValid) {
    if (institutionsCount === 0) return redirectTo("/onboarding", req, { clearInvite: true });
    return plain200("Invitación inválida o expirada. Solicita una nueva invitación.", { clearInvite: true });
  }

  // ✅ Validación extra por rol (para no crear usuarios incompletos)
  if (invite.role === "STUDENT" && !invite.courseId) {
    return plain200("Invitación inválida: falta curso para estudiante.", { clearInvite: true });
  }
  if (invite.role === "TEACHER" && (!invite.courseAssignments || invite.courseAssignments.length === 0)) {
    return plain200("Invitación inválida: falta asignación de cursos para profesor.", { clearInvite: true });
  }

  await prisma.$transaction(async (tx) => {
    // 1) Crear AppUser “real”
    const created = await tx.appUser.create({
      data: {
        authUserId: authUser.id,
        email,
        role: invite.role,
        institutionId: invite.institutionId,
        fullName: authUser.displayName ?? null,

        // ✅ STUDENT queda asignado al curso desde la invitación
        courseId: invite.role === "STUDENT" ? invite.courseId : null,

        // ✅ ADMIN: si quieres, también puedes pasar positionTitle desde invite
        positionTitle: invite.role === "ADMINISTRATIVE" ? (invite.positionTitle ?? null) : null,
      },
      select: { id: true },
    });

    // 2) si TEACHER: materializar asignaciones a TeacherCourse
    if (invite.role === "TEACHER") {
      const rows = (invite.courseAssignments ?? [])
        .filter((a) => a.institutionId === invite.institutionId) // extra safety
        .map((a) => ({
          teacherId: createdUser.id,
          courseId: a.courseId,
          institutionId: invite.institutionId,
          isChief: a.isChief,
        }));

      if (rows.length === 0) {
        // opcional: si quieres forzar que un teacher siempre tenga cursos
        throw new Error("INVITE_TEACHER_MISSING_ASSIGNMENTS");
      }

      await tx.teacherCourse.createMany({
        data: rows,
        skipDuplicates: true,
      });
    }

    // 3) Marcar invitación como usada
    await tx.invitation.update({
      where: { id: invite.id },
      data: { usedAt: new Date() },
    });
  });

  return redirectTo("/complete-profile", req, { clearInvite: true });
}
