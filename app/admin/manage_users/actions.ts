'use server'

import { refresh } from 'next/cache';
import { getCurrentUser } from '@/lib/check-user-auth';
import prisma from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma/client";
import { roles } from '@/app/generated/prisma/enums'
import type { ActionResult } from '@/lib/local-types'


export async function updateRole(formData: FormData): Promise<ActionResult<string>> {

  const userId = formData.get("userId") as string;
  const newRole = formData.get("role") as roles;

  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "admin") {
    return {
      ok: false,
      error: "Access denied"
    };
  }

  if (!userId || !newRole) {
    return {
      ok: false,
      error: "User ID or role is missing"
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
          ok: false,
          error: "The user does not exist"
        };
      }
    }

    return {
      ok: false,
      error: "Something went wrong while updating the role"
    };
  }

  refresh();

  return {
    ok: true,
    data: "Role updated successfully"
  };
}
