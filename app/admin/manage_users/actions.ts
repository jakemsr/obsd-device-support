'use server'

import { refresh } from 'next/cache';
import { getCurrentUser } from '@/lib/check-user-auth';
import prisma from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma/client";
import { roles } from '@/app/generated/prisma/enums'
import type { ActionState } from '@/lib/local-types'


export async function updateRole(formData: FormData): Promise<ActionState> {

  const userId = formData.get("userId") as string;
  const newRole = formData.get("role") as roles;

  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "admin") {
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

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        return {
          error: "Not found",
          success: false,
          message: "The user does not exist.",
        };
      }
    }

    return {
      error: "Database error",
      success: false,
      message: "Something went wrong while updating the role.",
    };
  }

  refresh();

  return {
    error: '',
    success: true,
    message: 'Role updated successfully'
  };
}
