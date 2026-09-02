'use server'

import { refresh } from 'next/cache';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth'
import prisma from "@/lib/prisma";
import { roles } from '@/app/generated/prisma/enums'


export async function updateRole(formData: FormData) {
  const userId = formData.get("userId") as string;
  const newRole = formData.get("role") as roles;

  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session || !session.user || session.user.role !== "admin") {
    throw new Error('Unauthorized')
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
  });

  refresh();
}
