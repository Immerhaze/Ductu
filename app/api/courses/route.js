import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { stackServerApp } from '@/stack/server';

export async function GET(req) {
  const user = await stackServerApp.getUser({ or: 'redirect' });

  const appUser = await prisma.appUser.findUnique({
    where: { authUserId: user.id },
    select: { institutionId: true, role: true, isActive: true },
  });

  if (!appUser?.institutionId) {
    return NextResponse.json({ error: 'No institution' }, { status: 401 });
  }

  // Solo admins (o superadmin) deberían listar cursos para invitar
  if (appUser.role !== 'ADMINISTRATIVE') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const onlyActive = searchParams.get('onlyActive') === '1';

  const courses = await prisma.course.findMany({
    where: {
      institutionId: appUser.institutionId,
      ...(onlyActive ? { isActive: true } : {}),
    },
    select: { id: true, name: true, isActive: true },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json({ courses });
}
