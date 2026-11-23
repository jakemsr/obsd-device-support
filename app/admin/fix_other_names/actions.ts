"use server";

import prisma from '@/lib/prisma';
import { Prisma } from "@/app/generated/prisma/client";
import { getCurrentUser } from "@/lib/check-user-auth";
import type { AuthUser, ActionResult } from "@/lib/local-types";
import { formatFieldName, requiredString } from "@/lib/zod-helpers";
import type { other_device_names } from "@/app/generated/prisma/client";
import { z } from "zod";


export async function getOtherNamesWithEmptyVendor(): Promise<other_device_names[]> {
  const other_names = await prisma.other_device_names.findMany({
    where: {
      vendor_name: ""
    },
    orderBy: {
      device_name: "asc"
    }
  });
  return other_names;
}

export type OtherNameWithDevice = Prisma.other_device_namesGetPayload<{
  include: {
    devices: {
      include: {
        vendors: true
      }
    }
  },
}>;

export async function getOtherNameById(id: bigint): Promise<OtherNameWithDevice | null> {
  const other_name = await prisma.other_device_names.findUnique({
    where: {
      id: id
    },
    include: {
      devices: {
        include: {
          vendors: true
        }
      }
    },
  });
  return other_name;
}

const updateOtherNameSchema = z.object({
  vendor_name: requiredString,
  device_name: requiredString,
  delete_entry: z.literal("on").nullable()
    .transform(value => value === "on"),
  id: requiredString.pipe(z.string().regex(/^\d+$/, "Expected a numeric ID")),
});

export async function updateOtherName(formData: FormData): Promise<ActionResult<string>> {

  const currentUser: AuthUser | null = await getCurrentUser();

  if (!currentUser || currentUser.role !== 'admin') {
    return { ok: false, error: "Access denied" };
  }

  const result = updateOtherNameSchema.safeParse({
    vendor_name: formData.get("vendor_name"),
    device_name: formData.get("device_name"),
    delete_entry: formData.get("delete_entry"),
    id: formData.get("device_id")
  });
  if (!result.success) {
    const issue = result.error.issues[0];
    return { ok: false, error: `${formatFieldName(issue.path)}: ${issue.message}` };
  }

  const validated = result.data;
  try {
    if (validated.delete_entry) {
      await prisma.other_device_names.delete({
        where: { id: BigInt(validated.id) },
      });
      return { ok: true, data: 'Deleted id: ' + validated.id };
    }

    const updatedOtherName = await prisma.other_device_names.update({
      where: { id: BigInt(validated.id) },
      data: {
        vendor_name: validated.vendor_name,
        device_name: validated.device_name,
      },
    });

    return {
      ok: true,
      data: "Other name updated, vendor: " + updatedOtherName.vendor_name +
        " device: " + updatedOtherName.device_name
    };
  } catch (error) {
    return { ok: false,  error: error instanceof Error ? error.message : String(error) };
  }
}
