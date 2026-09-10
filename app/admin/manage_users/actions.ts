'use server'

import { refresh } from 'next/cache';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth'
import prisma from "@/lib/prisma";
import { roles } from '@/app/generated/prisma/enums'
import type { ActionState } from '@/lib/local-types'


export async function updateRole(
  prevState: ActionState, formData: FormData
): Promise<ActionState> {

  const userId = formData.get("userId") as string;
  const newRole = formData.get("role") as roles;

  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session || !session.user || session.user.role !== "admin") {
    return {
      error: 'Unauthorized',
      success: false,
      message: 'Not logged in or not an admin'
    };
  }

  if (!userId || !newRole) {
    return {
      error: 'Invalid input',
      success: false,
      message: 'User ID or role is missing'
    };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
  });

  refresh();
  
  return {
    error: '',
    success: true,
    message: 'Role updated successfully'
  };
}
