"use server";

import prisma from '@/lib/prisma';
import { Prisma } from "@/app/generated/prisma/client";
import { getCurrentUser } from "@/lib/check-user-auth";
import type { AuthUser, ActionResult } from "@/lib/local-types";


export interface OtherName {
  id: bigint;
  device_name: string;
  device_id: bigint;
  vendor_name: string;
}

export async function getOtherNames(): Promise<OtherName[]> {
  const other_names = await prisma.other_device_names.findMany({
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

export async function updateOtherName(
  vendor_name: string,
  device_name: string,
  delete_entry: boolean,
  id: string
): Promise<ActionResult<string>> {

  const currentUser: AuthUser | null = await getCurrentUser();

  if (!currentUser || currentUser.role !== 'admin') {
    return { ok: false, error: "Access denied" };
  }

  try {
    if (!vendor_name) {
      return { ok: false,  error: "Vendor name is required" };
    }
    if (!device_name) {
      return { ok: false,  error: "Device name is required" };
    }
    if (delete_entry === undefined) {
      return { ok: false, error: "Delete entry flag is required" };
    }
    if (!id) {
      return { ok: false, error: "ID is required" };
    }

    if (delete_entry) {
      await prisma.other_device_names.delete({
        where: { id: BigInt(id) },
      });
      return { ok: true, data: 'Deleted id: ' + id };
    }

    const updatedOtherName = await prisma.other_device_names.update({
      where: { id: BigInt(id) },
      data: {
        vendor_name: vendor_name,
        device_name: device_name,
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
