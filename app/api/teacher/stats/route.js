// app/api/teacher/stats/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAppUser } from "@/lib/authz";

export async function GET() {
  try {
    const { appUser } = await requireAppUser({ requireProfileCompleted: true });

    if (appUser.role !== "TEACHER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const institutionId = appUser.institutionId;
    const teacherId = appUser.id;

    const policy = await prisma.institutionAcademicPolicy.findUnique({
      where: { institutionId },
      select: { passingGrade: true, activeAcademicYearId: true },
    });

    const passingGrade = policy ? Number(policy.passingGrade) : 4.0;
    const activeAcademicYearId = policy?.activeAcademicYearId;

    // Asignaciones activas del docente en el año activo
    const assignments = await prisma.teachingAssignment.findMany({
      where: {
        teacherId,
        institutionId,
        isActive: true,
        ...(activeAcademicYearId ? { academicYearId: activeAcademicYearId } : {}),
      },
      select: {
        id: true,
        course: { select: { id: true, name: true } },
        subject: { select: { id: true, name: true } },
      },
    });

    const assignmentIds = assignments.map((a) => a.id);

    // Todas las notas de las asignaciones de este docente
    const grades = await prisma.grade.findMany({
      where: { teachingAssignmentId: { in: assignmentIds } },
      select: {
        value: true,
        studentId: true,
        teachingAssignment: {
          select: {
            courseId: true,
            course: { select: { id: true, name: true } },
            subject: { select: { id: true, name: true } },
          },
        },
        student: { select: { id: true, fullName: true } },
      },
    });

    // Cursos únicos donde enseña
    const coursesMap = {};
    assignments.forEach((a) => {
      if (!coursesMap[a.course.id]) {
        coursesMap[a.course.id] = { id: a.course.id, name: a.course.name };
      }
    });
    const courses = Object.values(coursesMap);

    // Materias únicas que enseña
    const subjectsMap = {};
    assignments.forEach((a) => {
      if (!subjectsMap[a.subject.id]) {
        subjectsMap[a.subject.id] = { id: a.subject.id, name: a.subject.name };
      }
    });
    const subjects = Object.values(subjectsMap);

    // KPIs
    const uniqueStudents = new Set(grades.map((g) => g.studentId));
    const totalStudentsTaught = uniqueStudents.size;

    // Promedio por estudiante para pass/fail
    const studentGradeMap = {};
    grades.forEach((g) => {
      const sid = g.studentId;
      if (!studentGradeMap[sid]) studentGradeMap[sid] = { sum: 0, count: 0 };
      studentGradeMap[sid].sum += Number(g.value);
      studentGradeMap[sid].count += 1;
    });

    const passingStudents = Object.values(studentGradeMap).filter(
      (s) => s.count > 0 && s.sum / s.count >= passingGrade
    ).length;
    const failingStudents = totalStudentsTaught - passingStudents;

    // Rendimiento individual por curso: [{ courseId, courseName, students: [{ id, name, avgGrade }] }]
    const studentPerCourse = {};
    grades.forEach((g) => {
      const courseId = g.teachingAssignment.courseId;
      const courseName = g.teachingAssignment.course.name;
      const sid = g.studentId;
      const sname = g.student?.fullName ?? "Sin nombre";

      if (!studentPerCourse[courseId]) {
        studentPerCourse[courseId] = { courseId, courseName, students: {} };
      }
      if (!studentPerCourse[courseId].students[sid]) {
        studentPerCourse[courseId].students[sid] = { id: sid, name: sname, sum: 0, count: 0 };
      }
      studentPerCourse[courseId].students[sid].sum += Number(g.value);
      studentPerCourse[courseId].students[sid].count += 1;
    });

    const studentPerformancePerCourse = Object.values(studentPerCourse).map((c) => ({
      courseId: c.courseId,
      courseName: c.courseName,
      students: Object.values(c.students).map((s) => ({
        id: s.id,
        name: s.name,
        avgGrade: s.count > 0 ? Math.round((s.sum / s.count) * 10) / 10 : 0,
      })),
    }));

    // Estudiantes en riesgo (promedio < passingGrade en las materias del docente)
    const studentsAtRisk = Object.entries(studentGradeMap)
      .filter(([, s]) => s.count > 0 && s.sum / s.count < passingGrade)
      .map(([sid]) => {
        const gradeEntry = grades.find((g) => g.studentId === sid);
        const courseId = gradeEntry?.teachingAssignment?.courseId;
        const courseName = gradeEntry?.teachingAssignment?.course?.name ?? "";
        const avg = studentGradeMap[sid];
        return {
          id: sid,
          name: gradeEntry?.student?.fullName ?? "Sin nombre",
          courseName,
          avgGrade: Math.round((avg.sum / avg.count) * 10) / 10,
        };
      });

    return NextResponse.json({
      kpis: {
        coursesTaught: courses.length,
        totalStudentsTaught,
        passingStudents,
        failingStudents,
      },
      courses,
      subjects,
      studentPerformancePerCourse,
      studentsAtRisk,
    });
  } catch (e) {
    console.error("[api/teacher/stats]", e?.message, e);
    const code = e?.message;
    if (code === "APP_USER_NOT_FOUND")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (code === "PROFILE_INCOMPLETE")
      return NextResponse.json({ error: "Profile incomplete" }, { status: 403 });
    if (code === "NO_INSTITUTION")
      return NextResponse.json({ error: "No institution" }, { status: 403 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}