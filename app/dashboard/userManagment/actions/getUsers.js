import "server-only";
import prisma from "@/lib/prisma";
import { requireAppUser } from "@/lib/authz";

export async function getUsersForTable() {
  const { appUser } = await requireAppUser({
    roles: ["ADMINISTRATIVE"],
    requireProfileCompleted: true,
  });

  const institutionId = appUser.institutionId;

  const users = await prisma.appUser.findMany({
    where: { institutionId }, // ✅ aislamiento por institución
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      isActive: true,
      positionTitle: true,

      // STUDENT: curso principal
      course: { select: { name: true } },

      // TEACHER: cursos asignados (y si es jefe)
      teacherCourses: {
  select: {
    isChief: true,                 // ✅ necesario
    course: { select: { name: true } },
  },
},

    },
  });

  return users.map((u) => {
    const courses = [];

    if (u.role === "STUDENT" && u.course?.name) {
      courses.push(u.course.name);
    }

    if (u.role === "TEACHER" && u.teacherCourses?.length) {
      courses.push(
        ...u.teacherCourses.map((tc) =>
          tc.isChief ? `${tc.course.name} (Jefe)` : tc.course.name
        )
      );
    }

    return {
      id: String(u.id),
      name: u.fullName || u.email,
      rol: u.role, // ✅ admin “trae el rol” aquí
      cargo: u.positionTitle || "-",
      curso: courses, // ✅ teacher/student traen cursos; admin queda []
      estado: u.isActive ? "Activo" : "Inactivo",
    };
  });
}
