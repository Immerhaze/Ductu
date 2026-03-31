// app/api/teacher/chief-stats/route.js
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

    // Verificar si es profesor jefe de algún curso
    const chiefCourses = await prisma.teacherCourse.findMany({
      where: { teacherId, institutionId, isChief: true },
      select: {
        course: { select: { id: true, name: true } },
      },
    });

    if (chiefCourses.length === 0) {
      return NextResponse.json({ isChief: false });
    }

    const chiefCourseIds = chiefCourses.map((c) => c.course.id);

    const policy = await prisma.institutionAcademicPolicy.findUnique({
      where: { institutionId },
      select: { passingGrade: true, activeAcademicYearId: true },
    });

    const passingGrade = policy ? Number(policy.passingGrade) : 4.0;
    const activeAcademicYearId = policy?.activeAcademicYearId;

    // Todas las notas de los cursos donde es jefe
    const grades = await prisma.grade.findMany({
      where: {
        institutionId,
        teachingAssignment: {
          courseId: { in: chiefCourseIds },
          isActive: true,
          ...(activeAcademicYearId ? { academicYearId: activeAcademicYearId } : {}),
        },
      },
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

    // KPIs globales de los cursos jefe
    const uniqueStudents = new Set(grades.map((g) => g.studentId));
    const totalStudents = uniqueStudents.size;

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
    const failingStudents = totalStudents - passingStudents;

    // Promedio por asignatura por curso
    const courseSubjectMap = {};
    grades.forEach((g) => {
      const courseId = g.teachingAssignment.courseId;
      const courseName = g.teachingAssignment.course.name;
      const subjectId = g.teachingAssignment.subject.id;
      const subjectName = g.teachingAssignment.subject.name;

      if (!courseSubjectMap[courseId]) {
        courseSubjectMap[courseId] = { courseId, courseName, subjects: {} };
      }
      if (!courseSubjectMap[courseId].subjects[subjectId]) {
        courseSubjectMap[courseId].subjects[subjectId] = { id: subjectId, name: subjectName, sum: 0, count: 0 };
      }
      courseSubjectMap[courseId].subjects[subjectId].sum += Number(g.value);
      courseSubjectMap[courseId].subjects[subjectId].count += 1;
    });

    const subjectAveragesPerCourse = Object.values(courseSubjectMap).map((c) => ({
      courseId: c.courseId,
      courseName: c.courseName,
      subjects: Object.values(c.subjects).map((s) => ({
        id: s.id,
        name: s.name,
        avgGrade: s.count > 0 ? Math.round((s.sum / s.count) * 10) / 10 : 0,
      })),
    }));

    // Rendimiento general por alumno por curso
    const courseStudentMap = {};
    grades.forEach((g) => {
      const courseId = g.teachingAssignment.courseId;
      const courseName = g.teachingAssignment.course.name;
      const sid = g.studentId;
      const sname = g.student?.fullName ?? "Sin nombre";

      if (!courseStudentMap[courseId]) {
        courseStudentMap[courseId] = { courseId, courseName, students: {} };
      }
      if (!courseStudentMap[courseId].students[sid]) {
        courseStudentMap[courseId].students[sid] = { id: sid, name: sname, sum: 0, count: 0, subjectsBelowPassing: [] };
      }
      courseStudentMap[courseId].students[sid].sum += Number(g.value);
      courseStudentMap[courseId].students[sid].count += 1;

      const subjectAvg = Number(g.value);
      if (subjectAvg < passingGrade) {
        const subjectName = g.teachingAssignment.subject.name;
        if (!courseStudentMap[courseId].students[sid].subjectsBelowPassing.includes(subjectName)) {
          courseStudentMap[courseId].students[sid].subjectsBelowPassing.push(subjectName);
        }
      }
    });

    const studentPerformancePerCourse = Object.values(courseStudentMap).map((c) => ({
      courseId: c.courseId,
      courseName: c.courseName,
      students: Object.values(c.students).map((s) => ({
        id: s.id,
        name: s.name,
        avgGrade: s.count > 0 ? Math.round((s.sum / s.count) * 10) / 10 : 0,
        subjectsBelowPassing: s.subjectsBelowPassing,
      })),
    }));

    // Estudiantes en riesgo por curso
    const studentsAtRiskPerCourse = Object.values(courseStudentMap).map((c) => ({
      courseId: c.courseId,
      courseName: c.courseName,
      students: Object.values(c.students)
        .filter((s) => s.count > 0 && s.sum / s.count < passingGrade)
        .map((s) => ({
          id: s.id,
          name: s.name,
          avgGrade: Math.round((s.sum / s.count) * 10) / 10,
          subjectsBelowPassing: s.subjectsBelowPassing,
        })),
    }));

    return NextResponse.json({
      isChief: true,
      kpis: {
        coursesLed: chiefCourses.length,
        totalStudents,
        passingStudents,
        failingStudents,
      },
      chiefCourses: chiefCourses.map((c) => ({ id: c.course.id, name: c.course.name })),
      subjectAveragesPerCourse,
      studentPerformancePerCourse,
      studentsAtRiskPerCourse,
    });
  } catch (e) {
    console.error("[api/teacher/chief-stats]", e?.message, e);
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