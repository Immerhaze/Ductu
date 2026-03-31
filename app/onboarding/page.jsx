import { redirect } from "next/navigation";
import { stackServerApp } from "@/stack/server";
import prisma from "@/lib/prisma";
import OnboardingWizard from "./OnboardingWizard";

const DEFAULT_SUBJECTS = [
  { name: "Lenguaje y Comunicación", code: "LENG" },
  { name: "Matemática", code: "MAT" },
  { name: "Historia, Geografía y Ciencias Sociales", code: "HIS" },
  { name: "Ciencias Naturales", code: "CNAT" },
  { name: "Inglés", code: "ING" },
  { name: "Educación Física y Salud", code: "EFI" },
  { name: "Artes Visuales", code: "ART" },
  { name: "Tecnología", code: "TEC" },
  { name: "Orientación", code: "ORI" },
  { name: "Religión", code: "REL" },
];

function buildSections(sectionNaming, sectionCount) {
  if (sectionNaming === "NUMBERS") {
    return Array.from({ length: sectionCount }, (_, i) => String(i + 1));
  }

  return "ABCDEFGHIJKLMNOPQRSTUVWXYZ".slice(0, sectionCount).split("");
}

function parseLevel(levelCode) {
  const levelType = levelCode.startsWith("B") ? "BASIC" : "MIDDLE";
  const levelNumber = Number(levelCode.slice(1));
  return { levelType, levelNumber };
}

function courseName({ levelType, levelNumber, section, nameFormat }) {
  if (nameFormat === "CHILE_TRADITIONAL") {
    return levelType === "BASIC"
      ? `${levelNumber}° ${section}`
      : `${levelNumber}° Medio ${section}`;
  }

  if (nameFormat === "COMPACT") {
    return levelType === "BASIC"
      ? `${levelNumber}${section}`
      : `${levelNumber}M${section}`;
  }

  if (nameFormat === "HUNDREDS") {
    if (levelType === "MIDDLE") {
      const numericSection = /^\d+$/.test(section)
        ? Number(section)
        : section.charCodeAt(0) - 64;
      return String(levelNumber * 100 + numericSection);
    }

    return `${levelNumber}${section}`;
  }

  return `${levelNumber}${section}`;
}

function buildAcademicPeriods({ academicRegime, startDate, endDate }) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error("INVALID_ACADEMIC_DATES");
  }

  const periods = [];

  if (academicRegime === "SEMESTER") {
    const mid = new Date(start);
    mid.setMonth(start.getMonth() + 6);

    periods.push({
      name: "1° Semestre",
      periodNumber: 1,
      startDate: start,
      endDate: new Date(mid.getTime() - 1),
      isActive: true,
    });

    periods.push({
      name: "2° Semestre",
      periodNumber: 2,
      startDate: mid,
      endDate: end,
      isActive: false,
    });

    return periods;
  }

  if (academicRegime === "TRIMESTER") {
    for (let i = 0; i < 3; i += 1) {
      const pStart = new Date(start);
      pStart.setMonth(start.getMonth() + i * 4);

      const pEnd = i === 2 ? end : new Date(pStart);
      if (i !== 2) {
        pEnd.setMonth(pStart.getMonth() + 4);
        pEnd.setTime(pEnd.getTime() - 1);
      }

      periods.push({
        name: `${i + 1}° Trimestre`,
        periodNumber: i + 1,
        startDate: pStart,
        endDate: pEnd,
        isActive: i === 0,
      });
    }

    return periods;
  }

  for (let i = 0; i < 4; i += 1) {
    const pStart = new Date(start);
    pStart.setMonth(start.getMonth() + i * 3);

    const pEnd = i === 3 ? end : new Date(pStart);
    if (i !== 3) {
      pEnd.setMonth(pStart.getMonth() + 3);
      pEnd.setTime(pEnd.getTime() - 1);
    }

    periods.push({
      name: `${i + 1}° Período`,
      periodNumber: i + 1,
      startDate: pStart,
      endDate: pEnd,
      isActive: i === 0,
    });
  }

  return periods;
}

export default async function OnboardingPage() {
  await stackServerApp.getUser({ or: "redirect" });

  async function handleOnboarding(formData) {
    "use server";

    const currentUser = await stackServerApp.getUser({ or: "redirect" });
    const payloadRaw = formData.get("payload")?.toString();

    if (!payloadRaw) {
      throw new Error("ONBOARDING_PAYLOAD_MISSING");
    }

    const payload = JSON.parse(payloadRaw);

    const institutionName = payload?.institution?.name?.trim();
    const contactEmail = payload?.institution?.contactEmail?.trim()?.toLowerCase();
    const superAdminName = payload?.superAdmin?.fullName?.trim();
    const superAdminEmail = payload?.superAdmin?.email?.trim()?.toLowerCase();

    if (!institutionName || !superAdminName || !superAdminEmail) {
      throw new Error("ONBOARDING_REQUIRED_FIELDS_MISSING");
    }

    const activeLevels = Array.isArray(payload?.courseConfig?.activeLevels)
      ? payload.courseConfig.activeLevels
      : [];

    const sectionNaming = payload?.courseConfig?.sectionNaming || "LETTERS";
    const sectionCount = Number(payload?.courseConfig?.sectionCount || 2);
    const nameFormat = payload?.courseConfig?.nameFormat || "CHILE_TRADITIONAL";

    const academicRegime = payload?.academicPolicy?.academicRegime || "SEMESTER";
    const gradingScaleMin = Number(payload?.academicPolicy?.gradingScaleMin ?? 1.0);
    const gradingScaleMax = Number(payload?.academicPolicy?.gradingScaleMax ?? 7.0);
    const passingGrade = Number(payload?.academicPolicy?.passingGrade ?? 4.0);
    const gradeDecimals = Number(payload?.academicPolicy?.gradeDecimals ?? 1);
    const useAttendanceForPromotion = Boolean(
      payload?.academicPolicy?.useAttendanceForPromotion ?? true
    );
    const minimumAttendancePercent =
      payload?.academicPolicy?.minimumAttendancePercent === ""
        ? null
        : payload?.academicPolicy?.minimumAttendancePercent != null
          ? Number(payload.academicPolicy.minimumAttendancePercent)
          : 85;

    const academicYearValue = Number(payload?.academicYear?.year);
    const academicYearName =
      payload?.academicYear?.name?.trim() || `Año Académico ${academicYearValue}`;
    const academicYearStartDate = payload?.academicYear?.startDate;
    const academicYearEndDate = payload?.academicYear?.endDate;

    const subjects = Array.isArray(payload?.subjects)
      ? payload.subjects
          .map((subject) => ({
            name: String(subject?.name || "").trim(),
            code: String(subject?.code || "").trim().toUpperCase() || null,
          }))
          .filter((subject) => subject.name)
      : [];

    if (!academicYearValue || !academicYearStartDate || !academicYearEndDate) {
      throw new Error("ACADEMIC_YEAR_REQUIRED");
    }

    if (activeLevels.length === 0) {
      throw new Error("COURSES_REQUIRED");
    }

    if (subjects.length === 0) {
      throw new Error("SUBJECTS_REQUIRED");
    }

    const periods = buildAcademicPeriods({
      academicRegime,
      startDate: academicYearStartDate,
      endDate: academicYearEndDate,
    });

    await prisma.$transaction(async (tx) => {
      const institution = await tx.institution.create({
        data: {
          name: institutionName,
          contactEmail: contactEmail || superAdminEmail,
          status: "draft",
        },
        select: { id: true },
      });

      await tx.appUser.create({
        data: {
          email: superAdminEmail,
          fullName: superAdminName,
          role: "ADMINISTRATIVE",
          isSuperAdmin: true,
          institutionId: institution.id,
          authUserId: currentUser.id,
          profileCompletedAt: new Date(),
        },
      });

      const courseConfig = await tx.institutionCourseConfig.create({
        data: {
          institutionId: institution.id,
          activeLevels,
          sectionNaming,
          sectionCount,
          nameFormat,
        },
        select: {
          activeLevels: true,
          sectionNaming: true,
          sectionCount: true,
          nameFormat: true,
        },
      });

      const sections = buildSections(
        courseConfig.sectionNaming,
        courseConfig.sectionCount
      );

      const courseRows = [];

      for (const levelCode of courseConfig.activeLevels) {
        const { levelType, levelNumber } = parseLevel(levelCode);

        for (const section of sections) {
          courseRows.push({
            institutionId: institution.id,
            levelCode,
            levelType,
            levelNumber,
            section,
            name: courseName({
              levelType,
              levelNumber,
              section,
              nameFormat: courseConfig.nameFormat,
            }),
            isActive: true,
          });
        }
      }

      if (courseRows.length > 0) {
        await tx.course.createMany({
          data: courseRows,
          skipDuplicates: true,
        });
      }

      const academicYear = await tx.academicYear.create({
        data: {
          institutionId: institution.id,
          year: academicYearValue,
          name: academicYearName,
          startDate: new Date(academicYearStartDate),
          endDate: new Date(academicYearEndDate),
          isActive: true,
        },
        select: { id: true },
      });

      await tx.institutionAcademicPolicy.create({
        data: {
          institutionId: institution.id,
          academicRegime,
          gradingScaleMin,
          gradingScaleMax,
          passingGrade,
          gradeDecimals,
          useAttendanceForPromotion,
          minimumAttendancePercent,
          activeAcademicYearId: academicYear.id,
        },
      });

      await tx.academicPeriod.createMany({
        data: periods.map((period) => ({
          institutionId: institution.id,
          academicYearId: academicYear.id,
          name: period.name,
          periodNumber: period.periodNumber,
          startDate: period.startDate,
          endDate: period.endDate,
          isActive: period.isActive,
        })),
      });

      await tx.subject.createMany({
        data: subjects.map((subject) => ({
          institutionId: institution.id,
          name: subject.name,
          code: subject.code,
          isActive: true,
        })),
        skipDuplicates: true,
      });
    });

    redirect("/onboarding/complete");
  }

  const currentYear = new Date().getFullYear();

  const initialData = {
    institution: {
      name: "",
      contactEmail: "",
    },
    superAdmin: {
      fullName: "",
      email: "",
    },
    courseConfig: {
      activeLevels: ["B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "M1", "M2", "M3", "M4"],
      sectionNaming: "LETTERS",
      sectionCount: 2,
      nameFormat: "CHILE_TRADITIONAL",
    },
    academicPolicy: {
      academicRegime: "SEMESTER",
      gradingScaleMin: 1.0,
      gradingScaleMax: 7.0,
      passingGrade: 4.0,
      gradeDecimals: 1,
      useAttendanceForPromotion: true,
      minimumAttendancePercent: 85,
    },
    academicYear: {
      year: currentYear,
      name: `Año Académico ${currentYear}`,
      startDate: `${currentYear}-03-01`,
      endDate: `${currentYear}-12-20`,
    },
    subjects: DEFAULT_SUBJECTS,
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <OnboardingWizard action={handleOnboarding} initialData={initialData} />
    </main>
  );
}