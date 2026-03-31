// app/post-auth/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { stackServerApp } from "@/stack/server";
import { hashToken } from "@/lib/invitations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function redirectTo(path, req, { clearInvite = false, clearIntent = false } = {}) {
  const res = NextResponse.redirect(new URL(path, req.url));
  if (clearInvite) res.cookies.set("invite_token", "", { path: "/", maxAge: 0 });
  if (clearIntent) res.cookies.set("signup_intent", "", { path: "/", maxAge: 0 });
  return res;
}

function plain200(message, { clearInvite = false, clearIntent = false } = {}) {
  const res = new NextResponse(message, { status: 200 });
  if (clearInvite) res.cookies.set("invite_token", "", { path: "/", maxAge: 0 });
  if (clearIntent) res.cookies.set("signup_intent", "", { path: "/", maxAge: 0 });
  return res;
}

async function findExistingAppUser(authUserId) {
  return prisma.appUser.findUnique({
    where: { authUserId },
    select: {
      id: true,
      isActive: true,
      profileCompletedAt: true,
      institutionId: true,
      role: true,
    },
  });
}

async function validateInvite(inviteToken, email) {
  if (!inviteToken) return null;

  const tokenHash = hashToken(inviteToken);

  const invite = await prisma.invitation.findUnique({
    where: { tokenHash },
    select: {
      id: true,
      email: true,
      role: true,
      institutionId: true,
      usedAt: true,
      expiresAt: true,
      courseId: true,
      positionTitle: true,
    courseAssignments: {
  select: {
    courseId: true,
    subjectId: true,  
    isChief: true,
    institutionId: true,
  },
},
    },
  });

  if (!invite) return null;
  if (invite.usedAt) return null;
  if (invite.expiresAt < new Date()) return null;
  if (invite.email.toLowerCase() !== email.toLowerCase()) return null;

  if (invite.role === "STUDENT" && !invite.courseId) {
    throw new Error("INVITE_STUDENT_MISSING_COURSE");
  }

  if (invite.role === "TEACHER" && (!invite.courseAssignments || invite.courseAssignments.length === 0)) {
    throw new Error("INVITE_TEACHER_MISSING_ASSIGNMENTS");
  }

  return invite;
}

async function createInvitedUser({ authUser, email, invite }) {
  return prisma.$transaction(async (tx) => {
    const createdUser = await tx.appUser.create({
      data: {
        authUserId: authUser.id,
        email,
        role: invite.role,
        institutionId: invite.institutionId,
        fullName: authUser.displayName ?? null,
        courseId: invite.role === "STUDENT" ? invite.courseId : null,
        positionTitle: invite.positionTitle ?? null,
      },
      select: { id: true },
    });

    if (invite.role === "TEACHER") {
      const teacherCourseRows = (invite.courseAssignments ?? [])
        .filter((a) => a.institutionId === invite.institutionId)
        .map((a) => ({
          teacherId: createdUser.id,
          courseId: a.courseId,
          institutionId: invite.institutionId,
          isChief: a.isChief,
        }));

      if (teacherCourseRows.length === 0) {
        throw new Error("INVITE_TEACHER_MISSING_ASSIGNMENTS");
      }

      await tx.teacherCourse.createMany({
        data: teacherCourseRows,
        skipDuplicates: true,
      });
    }
    // Dentro de prisma.$transaction en createInvitedUser
// después del bloque if (invite.role === "TEACHER") { ... TeacherCourse ... }

// Crear TeachingAssignments
if (invite.role === "TEACHER" && invite.courseAssignments?.length > 0) {
  const policy = await tx.institutionAcademicPolicy.findUnique({
    where: { institutionId: invite.institutionId },
    select: { activeAcademicYearId: true },
  });

  if (policy?.activeAcademicYearId) {
    const assignmentRows = invite.courseAssignments
      .filter((a) => a.subjectId) // solo las que tienen asignatura
      .map((a) => ({
        institutionId: invite.institutionId,
        academicYearId: policy.activeAcademicYearId,
        teacherId: createdUser.id,
        courseId: a.courseId,
        subjectId: a.subjectId,
        isActive: true,
      }));

    if (assignmentRows.length > 0) {
      await tx.teachingAssignment.createMany({
        data: assignmentRows,
        skipDuplicates: true,
      });
    }
  }
}
    await tx.invitation.update({
      where: { id: invite.id },
      data: { usedAt: new Date() },
    });

    return createdUser;
  });
}

export async function GET(req) {
  const authUser = await stackServerApp.getUser({ or: "redirect" });
  const email = authUser.primaryEmail?.toLowerCase() ?? null;

  if (!email) {
    await authUser.signOut();
    return redirectTo("/auth?mode=login", req);
  }

  const existingAppUser = await findExistingAppUser(authUser.id);

  // 1) Ya existe en la BD
  if (existingAppUser) {
    if (!existingAppUser.isActive) {
      await authUser.signOut();
      return redirectTo("/auth?mode=login&error=account_disabled", req);
    }

    if (!existingAppUser.profileCompletedAt) {
      return redirectTo("/complete-profile", req);
    }

    return redirectTo("/dashboard", req);
  }

  const cookieStore = await cookies();
  const inviteToken = cookieStore.get("invite_token")?.value ?? null;
  const signupIntent = cookieStore.get("signup_intent")?.value ?? null;

  // 2) Flujo de invitación
  if (signupIntent === "invited" || inviteToken) {
    try {
      const invite = await validateInvite(inviteToken, email);

      if (!invite) {
        return plain200(
          "Esta invitación no es válida, ha expirado, o no coincide con tu email.",
          { clearInvite: true, clearIntent: true }
        );
      }

      await createInvitedUser({ authUser, email, invite });

      return redirectTo("/complete-profile", req, {
        clearInvite: true,
        clearIntent: true,
      });
    } catch (error) {
      if (error.message === "INVITE_STUDENT_MISSING_COURSE") {
        return plain200("Invitación inválida: falta asignación de curso del estudiante.", {
          clearInvite: true,
          clearIntent: true,
        });
      }
      if (error.message === "INVITE_TEACHER_MISSING_ASSIGNMENTS") {
        return plain200("Invitación inválida: falta asignación de cursos del docente.", {
          clearInvite: true,
          clearIntent: true,
        });
      }
      return plain200("No se pudo completar el registro. Contacta soporte o solicita una nueva invitación.", {
        clearInvite: true,
        clearIntent: true,
      });
    }
  }

  // 3) Flujo de registro de institución
  if (signupIntent === "institution") {
    return redirectTo("/onboarding", req, { clearInvite: true });
  }

  // 4) Fallback: Stack tiene sesión pero no hay AppUser ni intent conocido
  // Hacer sign out para romper el loop de redirección
  await authUser.signOut();

  return redirectTo("/auth?mode=login&error=registration_incomplete", req, {
    clearInvite: true,
    clearIntent: true,
  });
}