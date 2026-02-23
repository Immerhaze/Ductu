import { NextResponse } from "next/server";
import { getUsersForTableService } from "@/lib/server/admin/users.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const users = await getUsersForTableService();
    return NextResponse.json(users);
  } catch (e) {
    return NextResponse.json(
      { error: e?.message || "Unexpected error" },
      { status: 400 }
    );
  }
}




export async function DELETE(req, { params }) {
  try {
    const { appUser: requester } = await requireAppUser({
      roles: ["ADMINISTRATIVE"],
      requireProfileCompleted: true,
    });

    const targetId = params?.id;
    if (!targetId) {
      return NextResponse.json({ message: "User id requerido" }, { status: 400 });
    }

    // 1) Trae el usuario target (y authUserId) y valida institución
    const target = await prisma.appUser.findUnique({
      where: { id: targetId },
      select: {
        id: true,
        institutionId: true,
        authUserId: true,
        role: true,
        isSuperAdmin: true,
      },
    });

    if (!target || target.institutionId !== requester.institutionId) {
      return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });
    }

    // (recomendado) evitar auto-borrado
    if (target.id === requester.id) {
      return NextResponse.json(
        { message: "No puedes eliminar tu propio usuario." },
        { status: 400 }
      );
    }

    // (recomendado) evitar borrar superadmin desde UI normal
    if (target.isSuperAdmin) {
      return NextResponse.json(
        { message: "No puedes eliminar un Super Admin desde este panel." },
        { status: 403 }
      );
    }

    // 2) BORRAR EN STACK (auth)
    // stackServerApp.getUser(id) recibe el ID del usuario en Stack y retorna ServerUser :contentReference[oaicite:2]{index=2}
    const stackUser = await stackServerApp.getUser(target.authUserId);
    if (stackUser) {
      await stackUser.delete(); // user.delete() existe en el SDK :contentReference[oaicite:3]{index=3}
    }

    // 3) BORRAR EN DB
    // Tu schema ya tiene varias relaciones con onDelete: Cascade/SetNull,
    // así que appUser.delete debería arrastrar TeacherCourse, Posts, etc.
    await prisma.appUser.delete({
      where: { id: target.id },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/admin/users/[id] ERROR:", e);
    return NextResponse.json(
      { message: e?.message || "No se pudo eliminar el usuario" },
      { status: 500 }
    );
  }
}
