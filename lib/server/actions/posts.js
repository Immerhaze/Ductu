"use server";

import prisma from "@/lib/prisma";
import { requireAppUser } from "@/lib/authz";

const MAX_POST_CHARS = 2000;

function assertCanPost(appUser) {
  if (!appUser) throw new Error("No autenticado.");
  if (appUser.role !== "TEACHER" && appUser.role !== "ADMINISTRATIVE") {
    throw new Error("No autorizado para publicar.");
  }
}

export async function createPostAction({ content, targets, attachment }) {
  const { appUser } = await requireAppUser({ requireProfileCompleted: true });

  assertCanPost(appUser);

  const text = String(content ?? "").trim();
  if (!text) throw new Error("La publicación no puede estar vacía.");
  if (text.length > MAX_POST_CHARS) {
    throw new Error(`Máximo ${MAX_POST_CHARS} caracteres.`);
  }

  const normalizedTargets =
    Array.isArray(targets) && targets.length > 0
      ? targets
      : [{ type: "ALL" }];

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
          type: t.type,
          role: t.type === "ROLE" ? t.role : null,
          courseId: t.type === "COURSE" ? t.courseId : null,
        })),
      },
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      author: {
        select: { fullName: true, role: true },
      },
      attachment: {
        select: { url: true, name: true, mimeType: true },
      },
      targets: {
        select: { type: true, role: true, courseId: true },
      },
    },
  });

  try {
  let recipientIds = [];

  if (normalizedTargets.some((t) => t.type === "ALL")) {
    // Todos los usuarios de la institución excepto el autor
    const users = await prisma.appUser.findMany({
      where: { institutionId: appUser.institutionId, isActive: true, id: { not: appUser.id } },
      select: { id: true, email: true, fullName: true },
    });
    recipientIds = users;
  } else {
    const courseIds = normalizedTargets.filter((t) => t.type === "COURSE").map((t) => t.courseId);
    const roles     = normalizedTargets.filter((t) => t.type === "ROLE").map((t) => t.role);

    const users = await prisma.appUser.findMany({
      where: {
        institutionId: appUser.institutionId,
        isActive: true,
        id: { not: appUser.id },
        OR: [
          ...(courseIds.length ? [{ courseId: { in: courseIds } }] : []),
          ...(roles.length ? [{ role: { in: roles } }] : []),
        ],
      },
      select: { id: true, email: true, fullName: true },
    });
    recipientIds = users;
  }

  if (recipientIds.length > 0) {
    const { createNotifications } = await import("@/lib/notifications");
    await createNotifications(
      recipientIds.map((u) => ({ userId: u.id, email: u.email, fullName: u.fullName })),
      {
        type: "NEW_POST",
        title: `Nueva publicación de ${appUser.fullName ?? "tu institución"}`,
        body: text.slice(0, 120) + (text.length > 120 ? "..." : ""),
        link: "/dashboard",
      }
    );
  }
} catch (e) {
  console.error("[notifications] post error:", e?.message);
}

  return post;
}

export async function getFeedAction({ take = 20 } = {}) {
  const { appUser } = await requireAppUser({ requireProfileCompleted: true });

  const posts = await prisma.post.findMany({
    where: {
      institutionId: appUser.institutionId,
      OR: [
        { targets: { some: { type: "ALL" } } },
        { targets: { some: { type: "ROLE", role: appUser.role } } },
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
      author: {
        select: { fullName: true, role: true },
      },
      attachment: {
        select: { url: true, name: true, mimeType: true },
      },
      targets: {
        select: { type: true, role: true, courseId: true },
      },
    },
  });

  return posts;
}

export async function getCoursesForPostTargetsAction() {
  const { appUser } = await requireAppUser({ requireProfileCompleted: true });

  if (appUser.role === "ADMINISTRATIVE" || appUser.isSuperAdmin) {
    const courses = await prisma.course.findMany({
      where: {
        institutionId: appUser.institutionId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        isActive: true,
      },
      orderBy: { name: "asc" },
    });

    return { courses };
  }

  if (appUser.role === "TEACHER") {
    const courses = await prisma.course.findMany({
      where: {
        institutionId: appUser.institutionId,
        isActive: true,
        teacherCourses: { some: { teacherId: appUser.id } },
      },
      select: {
        id: true,
        name: true,
        isActive: true,
      },
      orderBy: { name: "asc" },
    });

    return { courses };
  }

  return { courses: [] };
}