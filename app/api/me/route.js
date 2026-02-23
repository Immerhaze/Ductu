import "server-only";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAppUser } from "@/lib/authz";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1) Gate: sesión válida + perfil completo
    const { appUser } = await requireAppUser({ requireProfileCompleted: true });

    // 2) DB: trae todo lo necesario para "me"
    const dbUser = await prisma.appUser.findUnique({
      where: { authUserId: appUser.authUserId },
      select: {
        id: true,
        authUserId: true,
        institutionId: true,
        role: true,
        fullName: true,
        email: true,
        isSuperAdmin: true,
        isActive: true,
        profileCompletedAt: true,

        course: { select: { id: true, name: true } },

        teacherCourses: {
          select: {
            isChief: true,
            course: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!dbUser) {
      return NextResponse.json(
        { code: "APP_USER_NOT_FOUND" },
        { status: 404 }
      );
    }

    const student =
      dbUser.role === "STUDENT" && dbUser.course
        ? { courseId: dbUser.course.id, courseName: dbUser.course.name }
        : null;

    const teacher =
      dbUser.role === "TEACHER"
        ? {
            courses: dbUser.teacherCourses.map((tc) => ({
              courseId: tc.course.id,
              courseName: tc.course.name,
              isChief: tc.isChief,
            })),
          }
        : null;

    return NextResponse.json({
      id: dbUser.id,
      authUserId: dbUser.authUserId,
      institutionId: dbUser.institutionId,
      role: dbUser.role,
      fullName: dbUser.fullName,
      email: dbUser.email,
      isSuperAdmin: dbUser.isSuperAdmin,
      isActive: dbUser.isActive,
      profileCompletedAt: dbUser.profileCompletedAt,
      student,
      teacher,
    });
  } catch (e) {
    const code = e?.code || e?.message || "UNKNOWN";

    // Deja que el frontend decida qué hacer con cada code
    // (tu layout ya hace redirects fuertes igual)
    return NextResponse.json({ code }, { status: 401 });
  }
}
