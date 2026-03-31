import "server-only";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAppUser } from "@/lib/authz";
import { stackServerApp } from "@/stack/server";


export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(_req, { params }) {
  const { appUser: requester } = await requireAppUser({
    roles: ["ADMINISTRATIVE"],
    requireProfileCompleted: true,
  });

  const userId = params?.id;
  if (!userId) return jsonError("Missing user id", 400);

  const target = await prisma.appUser.findFirst({
    where: { id: userId, institutionId: requester.institutionId },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      isActive: true,
      positionTitle: true,
      courseId: true,
      teacherCourses: {
        select: { courseId: true, isChief: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!target) return jsonError("User not found", 404);

  return NextResponse.json(target);
}

export async function PATCH(req, { params }) {
  const { appUser: requester } = await requireAppUser({
    roles: ["ADMINISTRATIVE"],
    requireProfileCompleted: true,
  });

  const userId = params?.id;
  if (!userId) return jsonError("Missing user id", 400);

  const body = await req.json().catch(() => null);
  if (!body) return jsonError("Invalid JSON body", 400);

  // 1) Cargar usuario target (para saber su rol real y aislar institución)
  const target = await prisma.appUser.findFirst({
    where: { id: userId, institutionId: requester.institutionId },
    select: {
      id: true,
      role: true,
      institutionId: true,
    },
  });

  if (!target) return jsonError("User not found", 404);

  // 2) Normalizar inputs permitidos
  const nextIsActive =
    typeof body.isActive === "boolean" ? body.isActive : undefined;

  const nextPositionTitle =
    typeof body.positionTitle === "string" ? body.positionTitle.trim() : undefined;

  const nextStudentCourseId =
    typeof body.studentCourseId === "string" ? body.studentCourseId : body.studentCourseId === null ? null : undefined;

  const teacherCourses =
    Array.isArray(body.teacherCourses) ? body.teacherCourses : undefined;
  // teacherCourses: [{courseId, isChief}]

  // 3) Validaciones por rol
  if (target.role === "ADMINISTRATIVE") {
    // positionTitle opcional/required depende de tu negocio; aquí lo dejamos editable
    // teacherCourses/studentCourseId no aplican
  }

  if (target.role === "STUDENT") {
    // Debe haber curso (por lógica de app). Si quieres permitir null, cámbialo.
    if (!nextStudentCourseId) {
      return jsonError("STUDENT requiere studentCourseId", 400);
    }
  }

  if (target.role === "TEACHER") {
    if (!teacherCourses || teacherCourses.length === 0) {
      return jsonError("TEACHER requiere teacherCourses (>=1)", 400);
    }

    // shape + chief <= 1
    let chiefs = 0;
    for (const tc of teacherCourses) {
      if (!tc?.courseId) return jsonError("teacherCourses inválido (courseId)", 400);
      if (typeof tc.isChief !== "boolean") return jsonError("teacherCourses inválido (isChief boolean)", 400);
      if (tc.isChief) chiefs++;
    }
    if (chiefs > 1) return jsonError("Solo puede existir 1 curso jefe por profesor.", 400);
  }

  // 4) Validar que cursos pertenezcan a la institución (para STUDENT y TEACHER)
  const courseIdsToCheck = [];
  if (target.role === "STUDENT") courseIdsToCheck.push(nextStudentCourseId);
  if (target.role === "TEACHER") courseIdsToCheck.push(...teacherCourses.map((x) => x.courseId));

  if (courseIdsToCheck.length) {
    const uniqueIds = [...new Set(courseIdsToCheck.filter(Boolean))];
    const count = await prisma.course.count({
      where: { id: { in: uniqueIds }, institutionId: requester.institutionId },
    });

    if (count !== uniqueIds.length) {
      return jsonError("Uno o más cursos no pertenecen a la institución.", 400);
    }
  }

  // 5) Persistencia: update AppUser + (si TEACHER) replace TeacherCourse
  const result = await prisma.$transaction(async (tx) => {
    const updatedUser = await tx.appUser.update({
      where: { id: target.id },
      data: {
        ...(nextIsActive !== undefined ? { isActive: nextIsActive } : {}),
        ...(target.role === "ADMINISTRATIVE" && nextPositionTitle !== undefined
          ? { positionTitle: nextPositionTitle || null }
          : {}),
        ...(target.role === "STUDENT" && nextStudentCourseId !== undefined
          ? { courseId: nextStudentCourseId }
          : {}),
        // TEACHER: courseId en AppUser normalmente null (no lo tocamos aquí)
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
        positionTitle: true,
        courseId: true,
      },
    });

    let updatedTeacherCourses = [];

    if (target.role === "TEACHER") {
      // reemplazo total
      await tx.teacherCourse.deleteMany({
        where: { teacherId: target.id, institutionId: requester.institutionId },
      });

      await tx.teacherCourse.createMany({
        data: teacherCourses.map((tc) => ({
          teacherId: target.id,
          institutionId: requester.institutionId,
          courseId: tc.courseId,
          isChief: tc.isChief,
        })),
        skipDuplicates: true,
      });

      updatedTeacherCourses = await tx.teacherCourse.findMany({
        where: { teacherId: target.id, institutionId: requester.institutionId },
        select: { courseId: true, isChief: true, course: { select: { name: true } } },
        orderBy: { createdAt: "asc" },
      });
    }

    // Para STUDENT, devolvemos también nombre del curso (para refrescar tabla)
    let studentCourseName = null;
    if (target.role === "STUDENT" && updatedUser.courseId) {
      const c = await tx.course.findFirst({
        where: { id: updatedUser.courseId, institutionId: requester.institutionId },
        select: { name: true },
      });
      studentCourseName = c?.name ?? null;
    }

    return {
      updatedUser,
      teacherCourses: updatedTeacherCourses.map((x) => ({
        courseId: x.courseId,
        courseName: x.course.name,
        isChief: x.isChief,
      })),
      studentCourseName,
    };
  });

  return NextResponse.json({ ok: true, ...result });
}





