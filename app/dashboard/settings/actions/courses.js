// app/dashboard/settings/actions/courses.js
"use server";

import prisma from "@/lib/prisma";
import { stackServerApp } from "@/stack/server";

/* =========================
   Helpers: niveles base Chile
   ========================= */
function getBaseLevels() {
  const basic = Array.from({ length: 8 }, (_, i) => ({
    levelCode: `B${i + 1}`,
    levelType: "BASIC",
    levelNumber: i + 1,
  }));

  const middle = Array.from({ length: 4 }, (_, i) => ({
    levelCode: `M${i + 1}`,
    levelType: "MIDDLE",
    levelNumber: i + 1,
  }));

  return [...basic, ...middle];
}

function getSections(sectionNaming, sectionCount) {
  const count = Math.max(1, Math.min(12, Number(sectionCount || 1)));
  if (sectionNaming === "NUMBERS") {
    return Array.from({ length: count }, (_, i) => String(i + 1));
  }
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  return letters.slice(0, count);
}

function buildCourseName({
  nameFormat,
  levelType,
  levelNumber,
  section,
  sectionIndex,
  hundredsBase,
}) {
  if (nameFormat === "HUNDREDS") {
    // HUNDREDS recomendado solo para Media
    if (levelType === "MIDDLE") {
      // 1M => 100 + idx, 2M => 200 + idx...
      const base = levelNumber * 100;
      const offset = Number(hundredsBase || 100) - 100; // 100 => 0
      const value = base + (sectionIndex + 1) + offset;
      return String(value);
    }
    // fallback para básica
    return `${levelNumber}${section}`;
  }

  if (nameFormat === "COMPACT") {
    if (levelType === "MIDDLE") return `${levelNumber}M${section}`;
    return `${levelNumber}${section}`;
  }

  // CHILE_TRADITIONAL (default)
  if (levelType === "MIDDLE") return `${levelNumber}° Medio ${section}`;
  return `${levelNumber}°${section}`;
}

function normalizeActiveLevels(activeLevels) {
  const all = getBaseLevels().map((l) => l.levelCode);
  if (!Array.isArray(activeLevels) || activeLevels.length === 0) return all;
  const set = new Set(activeLevels);
  return all.filter((code) => set.has(code));
}

async function assertSuperAdmin() {
  const user = await stackServerApp.getUser({ or: "throw" });

  const appUser = await prisma.appUser.findUnique({
    where: { authUserId: user.id },
    select: { id: true, isSuperAdmin: true, institutionId: true },
  });

  if (!appUser) throw new Error("No existe perfil interno asociado a esta sesión.");
  if (!appUser.isSuperAdmin) throw new Error("Solo el Super Admin puede configurar cursos.");

  return appUser;
}

/* =========================
   Actions
   ========================= */

export async function getCoursesAdminViewAction() {
  const appUser = await assertSuperAdmin();
  const institutionId = appUser.institutionId;

  const [config, courses] = await Promise.all([
    prisma.institutionCourseConfig.findUnique({ where: { institutionId } }),
    prisma.course.findMany({
      where: { institutionId },
      orderBy: [{ levelType: "asc" }, { levelNumber: "asc" }, { section: "asc" }],
    }),
  ]);

  return { ok: true, config, courses };
}

export async function saveCourseConfigAndGenerateCoursesAction(payload) {
  const appUser = await assertSuperAdmin();
  const institutionId = appUser.institutionId;

  const normalizedActiveLevels = normalizeActiveLevels(payload?.activeLevels);

  const normalizedSectionNaming =
    payload?.sectionNaming === "NUMBERS" ? "NUMBERS" : "LETTERS";

  const normalizedNameFormat =
    payload?.nameFormat === "COMPACT" || payload?.nameFormat === "HUNDREDS"
      ? payload?.nameFormat
      : "CHILE_TRADITIONAL";

  const normalizedSectionCount = Math.max(1, Math.min(12, Number(payload?.sectionCount || 1)));

  const normalizedHundredsBase = Number.isFinite(Number(payload?.hundredsBase))
    ? Number(payload.hundredsBase)
    : 100;

  const result = await prisma.$transaction(async (tx) => {
    // 1) Guardar config
    await tx.institutionCourseConfig.upsert({
      where: { institutionId },
      update: {
        activeLevels: normalizedActiveLevels,
        sectionNaming: normalizedSectionNaming,
        sectionCount: normalizedSectionCount,
        nameFormat: normalizedNameFormat,
        hundredsBase: normalizedHundredsBase,
      },
      create: {
        institutionId,
        activeLevels: normalizedActiveLevels,
        sectionNaming: normalizedSectionNaming,
        sectionCount: normalizedSectionCount,
        nameFormat: normalizedNameFormat,
        hundredsBase: normalizedHundredsBase,
      },
    });

    // 2) Construir cursos deseados
    const baseLevels = getBaseLevels().filter((l) => normalizedActiveLevels.includes(l.levelCode));
    const sections = getSections(normalizedSectionNaming, normalizedSectionCount);

    const desired = [];
    baseLevels.forEach((lvl) => {
      sections.forEach((section, idx) => {
        desired.push({
          institutionId,
          levelCode: lvl.levelCode,
          levelType: lvl.levelType,
          levelNumber: lvl.levelNumber,
          section,
          name: buildCourseName({
            nameFormat: normalizedNameFormat,
            levelType: lvl.levelType,
            levelNumber: lvl.levelNumber,
            section,
            sectionIndex: idx,
            hundredsBase: normalizedHundredsBase,
          }),
          isActive: true,
        });
      });
    });

    // 3) Upsert por clave estable
    for (const c of desired) {
      await tx.course.upsert({
        where: {
          institutionId_levelCode_section: {
            institutionId: c.institutionId,
            levelCode: c.levelCode,
            section: c.section,
          },
        },
        update: {
          levelType: c.levelType,
          levelNumber: c.levelNumber,
          name: c.name,
          isActive: true,
        },
        create: c,
      });
    }

    // 4) Desactivar lo que ya no aplica (soft)
    const desiredKeys = new Set(desired.map((d) => `${d.levelCode}:${d.section}`));

    const existing = await tx.course.findMany({
      where: { institutionId },
      select: { id: true, levelCode: true, section: true },
    });

    const toDeactivateIds = existing
      .filter((e) => !desiredKeys.has(`${e.levelCode}:${e.section}`))
      .map((e) => e.id);

    if (toDeactivateIds.length > 0) {
      await tx.course.updateMany({
        where: { id: { in: toDeactivateIds } },
        data: { isActive: false },
      });
    }

    return { activeCount: desired.length };
  });

  return { ok: true, ...result };
}
