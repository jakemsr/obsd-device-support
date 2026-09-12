'use server'

import { refresh } from 'next/cache';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth'
import prisma from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma/client";
import { roles } from '@/app/generated/prisma/enums'
import type { ActionState } from '@/lib/local-types'

export type RoleActionState = ActionState & {
  role: roles;
};

export async function updateRole(
  prevState: RoleActionState, formData: FormData
): Promise<RoleActionState> {

  const userId = formData.get("userId") as string;
  const newRole = formData.get("role") as roles;

  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session || !session.user || session.user.role !== "admin") {
    return {
      role: prevState.role,
      error: 'Unauthorized',
      success: false,
      message: 'Not logged in or not an admin'
    };
  }

  if (!userId || !newRole) {
    return {
      role: prevState.role,
      error: 'Invalid input',
      success: false,
      message: 'User ID or role is missing'
    };
  }

  let updatedRole: roles | null = null;
  try {
    updatedRole = (await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    })).role;
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        return {
          role: updatedRole ?? prevState.role,
          error: "Not found",
          success: false,
          message: "The user does not exist.",
        };
      }
    }

    return {
      role: updatedRole ?? prevState.role,
      error: "Database error",
      success: false,
      message: "Something went wrong while updating the role.",
    };
  }

  refresh();

  return {
    role: updatedRole,
    error: '',
    success: true,
    message: 'Role updated successfully'
  };
}
