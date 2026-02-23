"use server";

import prisma from "@/lib/prisma";
import { stackServerApp } from "@/stack/server";

const MAX_POST_CHARS = 2000;

function assertCanPost(appUser) {
  if (!appUser) throw new Error("No autenticado.");
  if (appUser.role !== "TEACHER" && appUser.role !== "ADMINISTRATIVE") {
    throw new Error("No autorizado para publicar.");
  }
}

export async function createPostAction({ content, targets, attachment }) {
  const user = await stackServerApp.getUser({ or: "throw" });

  const appUser = await prisma.appUser.findUnique({
    where: { authUserId: user.id },
    select: { id: true, role: true, institutionId: true, fullName: true },
  });

  assertCanPost(appUser);

  const text = String(content ?? "").trim();
  if (!text) throw new Error("La publicación no puede estar vacía.");
  if (text.length > MAX_POST_CHARS) throw new Error(`Máximo ${MAX_POST_CHARS} caracteres.`);

  // Normaliza targets: si viene vacío => ALL
  const normalizedTargets = Array.isArray(targets) && targets.length > 0 ? targets : [{ type: "ALL" }];

  // (Opcional) Crear attachment metadata si llega
  let attachmentId = null;
  if (attachment?.url && attachment?.mimeType && attachment?.name) {
    const created = await prisma.attachment.create({
      data: {
        url: attachment.url,
        mimeType: attachment.mimeType,
        name: attachment.name,
        size: attachment.size ?? null,
      },
      select: { id: true },
    });
    attachmentId = created.id;
  }

  const post = await prisma.post.create({
    data: {
      institutionId: appUser.institutionId,
      authorId: appUser.id,
      content: text,
      attachmentId,
      targets: {
        create: normalizedTargets.map((t) => ({
          type: t.type, // "ALL" | "ROLE" | "COURSE"
          role: t.type === "ROLE" ? t.role : null,
          courseId: t.type === "COURSE" ? t.courseId : null,
        })),
      },
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      author: { select: { fullName: true, role: true } },
      attachment: { select: { url: true, name: true, mimeType: true } },
      targets: { select: { type: true, role: true, courseId: true } },
    },
  });

  return post;
}

export async function getFeedAction({ take = 20 } = {}) {
  const user = await stackServerApp.getUser({ or: "throw" });

  const appUser = await prisma.appUser.findUnique({
    where: { authUserId: user.id },
    select: { id: true, role: true, institutionId: true, courseId: true },
  });

  if (!appUser) throw new Error("Perfil interno no encontrado.");

  const posts = await prisma.post.findMany({
    where: {
      institutionId: appUser.institutionId,
      OR: [
        // Visible para todos
        { targets: { some: { type: "ALL" } } },

        // Visible para tu rol
        { targets: { some: { type: "ROLE", role: appUser.role } } },

        // Visible para tu curso (si existe)
        ...(appUser.courseId
          ? [{ targets: { some: { type: "COURSE", courseId: appUser.courseId } } }]
          : []),
      ],
    },
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      content: true,
      createdAt: true,
      author: { select: { fullName: true, role: true } },
      attachment: { select: { url: true, name: true, mimeType: true } },
      targets: { select: { type: true, role: true, courseId: true } },
    },
  });

  return posts;
}


export async function getCoursesForPostTargetsAction() {
  const user = await stackServerApp.getUser({ or: "redirect" });

  const appUser = await prisma.appUser.findUnique({
    where: { authUserId: user.id },
    select: {
      id: true,
      role: true,
      institutionId: true,
      isSuperAdmin: true,
    },
  });

  if (!appUser) throw new Error("No existe perfil interno asociado a esta sesión.");

  // Admin: todos los cursos activos de la institución
  if (appUser.role === "ADMINISTRATIVE" || appUser.isSuperAdmin) {
    const courses = await prisma.course.findMany({
      where: { institutionId: appUser.institutionId, isActive: true },
      select: { id: true, name: true, isActive: true },
      orderBy: { name: "asc" },
    });

    return { courses };
  }

  // Teacher: cursos donde enseña (TeacherCourse) o donde es jefe (chiefTeacherId)
  if (appUser.role === "TEACHER") {
    const courses = await prisma.course.findMany({
      where: {
        institutionId: appUser.institutionId,
        isActive: true,
        OR: [
          { chiefTeacherId: appUser.id },
          { teacherCourses: { some: { teacherId: appUser.id } } },
        ],
      },
      select: { id: true, name: true, isActive: true },
      orderBy: { name: "asc" },
    });

    return { courses };
  }

  // Student (si no deberían publicar)
  return { courses: [] };
}