'use server'

import { refresh } from 'next/cache';
import { getCurrentUser } from '@/lib/check-user-auth';
import prisma from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma/client";
import { roles } from '@/app/generated/prisma/enums'
import type { ActionResult } from '@/lib/local-types'
import { formatFieldName, requiredString } from '@/lib/zod-helpers';
import { z } from 'zod';


const updateRoleSchema = z.object({
  userId: requiredString,
  role: z.enum(roles)
});

export async function updateRole(formData: FormData): Promise<ActionResult<string>> {

  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "admin") {
    return {
      ok: false,
      error: "Access denied"
    };
  }

  const result = updateRoleSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
  });
  if (!result.success) {
    const issue = result.error.issues[0];
    return { ok: false, error: `${formatFieldName(issue.path)}: ${issue.message}` };
  }

  try {
    await prisma.user.update({
      where: { id: result.data.userId },
      data: { role: result.data.role },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
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
