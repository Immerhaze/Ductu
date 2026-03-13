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

  if (clearInvite) {
    res.cookies.set("invite_token", "", {
      path: "/",
      maxAge: 0,
    });
  }

  if (clearIntent) {
    res.cookies.set("signup_intent", "", {
      path: "/",
      maxAge: 0,
    });
  }

  return res;
}

function plain200(message, { clearInvite = false, clearIntent = false } = {}) {
  const res = new NextResponse(message, { status: 200 });

  if (clearInvite) {
    res.cookies.set("invite_token", "", {
      path: "/",
      maxAge: 0,
    });
  }

  if (clearIntent) {
    res.cookies.set("signup_intent", "", {
      path: "/",
      maxAge: 0,
    });
  }

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
        positionTitle: invite.role === "ADMINISTRATIVE" ? invite.positionTitle ?? null : null,
      },
      select: {
        id: true,
      },
    });

    if (invite.role === "TEACHER") {
      const teacherCourseRows = (invite.courseAssignments ?? [])
        .filter((assignment) => assignment.institutionId === invite.institutionId)
        .map((assignment) => ({
          teacherId: createdUser.id,
          courseId: assignment.courseId,
          institutionId: invite.institutionId,
          isChief: assignment.isChief,
        }));

      if (teacherCourseRows.length === 0) {
        throw new Error("INVITE_TEACHER_MISSING_ASSIGNMENTS");
      }

      await tx.teacherCourse.createMany({
        data: teacherCourseRows,
        skipDuplicates: true,
      });
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
    return redirectTo("/auth?mode=login", req);
  }

  const existingAppUser = await findExistingAppUser(authUser.id);

  // 1) Already provisioned in app DB
  if (existingAppUser) {
    if (!existingAppUser.isActive) {
      return redirectTo("/auth?mode=login", req);
    }

    if (!existingAppUser.profileCompletedAt) {
      return redirectTo("/complete-profile", req);
    }

    return redirectTo("/dashboard", req);
  }

  const cookieStore = await cookies();
  const inviteToken = cookieStore.get("invite_token")?.value ?? null;
  const signupIntent = cookieStore.get("signup_intent")?.value ?? null;

  // 2) Invited signup flow
  if (signupIntent === "invited" || inviteToken) {
    try {
      const invite = await validateInvite(inviteToken, email);

      if (!invite) {
        return plain200(
          "This invitation is invalid, expired, or does not match your signed-in email. Please request a new invitation.",
          { clearInvite: true, clearIntent: true }
        );
      }

      await createInvitedUser({
        authUser,
        email,
        invite,
      });

      return redirectTo("/complete-profile", req, {
        clearInvite: true,
        clearIntent: true,
      });
    } catch (error) {
      if (error.message === "INVITE_STUDENT_MISSING_COURSE") {
        return plain200("Invalid invitation: missing student course assignment.", {
          clearInvite: true,
          clearIntent: true,
        });
      }

      if (error.message === "INVITE_TEACHER_MISSING_ASSIGNMENTS") {
        return plain200("Invalid invitation: missing teacher course assignments.", {
          clearInvite: true,
          clearIntent: true,
        });
      }

      return plain200("We could not finish your invited registration. Please contact support or request a new invitation.", {
        clearInvite: true,
        clearIntent: true,
      });
    }
  }

  // 3) Direct institution signup flow
  if (signupIntent === "institution") {
    return redirectTo("/onboarding", req, {
      clearInvite: true,
    });
  }

  // 4) Fallback:
  // authenticated in Stack Auth, but app user not provisioned
  // and we don't know what flow they started
  return redirectTo("/auth?mode=login&error=registration_incomplete", req, {
    clearInvite: true,
    clearIntent: true,
  });
}

