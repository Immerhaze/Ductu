// app/onboarding/page.jsx
import { stackServerApp } from "@/stack/server";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

// helpers: idealmente importarlos desde lib
const DEFAULT_ACTIVE_LEVELS = ["B1","B2","B3","B4","B5","B6","B7","B8","M1","M2","M3","M4"];

function buildSections(sectionNaming, sectionCount) {
  if (sectionNaming === "NUMBERS") return Array.from({ length: sectionCount }, (_, i) => String(i + 1));
  return "ABCDEFGHIJKLMNOPQRSTUVWXYZ".slice(0, sectionCount).split("");
}
function parseLevel(levelCode) {
  const levelType = levelCode.startsWith("B") ? "BASIC" : "MIDDLE";
  const levelNumber = Number(levelCode.slice(1));
  return { levelType, levelNumber };
}
function courseName({ levelType, levelNumber, section, nameFormat }) {
  if (nameFormat === "CHILE_TRADITIONAL") {
    return levelType === "BASIC" ? `${levelNumber}° ${section}` : `${levelNumber}° Medio ${section}`;
  }
  if (nameFormat === "COMPACT") {
    return levelType === "BASIC" ? `${levelNumber}${section}` : `${levelNumber}M${section}`;
  }
  // HUNDREDS
  if (levelType === "MIDDLE") {
    const base = levelNumber * 100;
    const sectionIndex = section.charCodeAt(0) - 64; // A=1,B=2...
    return String(base + sectionIndex); // 101, 102...
  }
  return `${levelNumber}${section}`;
}

export default async function OnboardingPage() {
  await stackServerApp.getUser({ or: "redirect" });

  async function handleOnboarding(formData) {
    "use server";

    const institutionName = formData.get("institutionName")?.toString().trim();
    const superAdminName = formData.get("superAdminName")?.toString().trim();
    const superAdminEmail = formData.get("superAdminEmail")?.toString().trim().toLowerCase();

    if (!institutionName || !superAdminName || !superAdminEmail) return;

    const currentUser = await stackServerApp.getUser({ or: "redirect" });

    await prisma.$transaction(async (tx) => {
      // 1) Institution
      const institution = await tx.institution.create({
        data: {
          name: institutionName,
          contactEmail: superAdminEmail,
          status: "draft",
        },
        select: { id: true },
      });

      // 2) Super admin AppUser
      await tx.appUser.create({
        data: {
          email: superAdminEmail,
          fullName: superAdminName,
          role: "ADMINISTRATIVE",
          isSuperAdmin: true,
          institutionId: institution.id,
          authUserId: currentUser.id,
        },
      });

      // 3) Default course config (base fija)
      const config = await tx.institutionCourseConfig.create({
        data: {
          institutionId: institution.id,
          activeLevels: DEFAULT_ACTIVE_LEVELS,
          sectionNaming: "LETTERS",
          sectionCount: 2,
          nameFormat: "CHILE_TRADITIONAL",
        },
        select: { activeLevels: true, sectionNaming: true, sectionCount: true, nameFormat: true },
      });

      // 4) Generate courses (idempotencia: como es onboarding no existen aún)
      const sections = buildSections(config.sectionNaming, config.sectionCount);

      const rows = [];
      for (const levelCode of config.activeLevels) {
        const { levelType, levelNumber } = parseLevel(levelCode);
        for (const section of sections) {
          rows.push({
            institutionId: institution.id,
            levelCode,
            levelType,
            levelNumber,
            section,
            name: courseName({ levelType, levelNumber, section, nameFormat: config.nameFormat }),
            isActive: true,
          });
        }
      }

      if (rows.length) {
        await tx.course.createMany({
          data: rows,
          skipDuplicates: true, // por si algún retry
        });
      }
    });

    redirect("/onboarding/complete");
  }

  // JSX completo
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-lg p-8 space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Registrar institución en DUCTU
        </h1>

        <p className="text-sm text-slate-600">
          Vamos a crear la institución y definir quién será el administrador principal.
        </p>

        <form action={handleOnboarding} className="space-y-6">
          {/* DATOS INSTITUCIÓN */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-800">
              Datos de la institución
            </h2>

            <div>
              <label
                htmlFor="institutionName"
                className="block text-sm font-medium text-slate-700"
              >
                Nombre de la institución *
              </label>
              <input
                id="institutionName"
                name="institutionName"
                required
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Colegio San Martín"
              />
            </div>
          </section>

          {/* DATOS SUPER ADMIN */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-800">
              Primer administrador de la institución
            </h2>

            <div>
              <label
                htmlFor="superAdminName"
                className="block text-sm font-medium text-slate-700"
              >
                Nombre completo del administrador *
              </label>
              <input
                id="superAdminName"
                name="superAdminName"
                required
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nombre y apellido"
              />
            </div>

            <div>
              <label
                htmlFor="superAdminEmail"
                className="block text-sm font-medium text-slate-700"
              >
                Email del administrador (para entrar a DUCTU) *
              </label>
              <input
                id="superAdminEmail"
                name="superAdminEmail"
                type="email"
                required
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="admin@institucion.com"
              />
            </div>

            <p className="text-xs text-slate-500">
              Más adelante, este administrador podrá invitar a otros usuarios
              (profesores, estudiantes y equipo administrativo).
            </p>
          </section>

          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Crear institución
          </button>
        </form>
      </div>
    </main>
  );
}
