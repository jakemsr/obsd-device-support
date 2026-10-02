import Link from "next/link";
import prisma from "@/lib/prisma";
import EditOtherName from "@/app/components/admin/EditOtherName";
import { getOtherNameById, OtherNameWithDevice } from "@/app/admin/fix_other_names/actions";
import { getCurrentUser } from "@/lib/check-user-auth";
import type { AuthUser } from "@/lib/local-types";


export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {

  const currentUser: AuthUser | null = await getCurrentUser();

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div>
        <h1>Unauthorized</h1>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  const { id } = await params;

  const other_name: OtherNameWithDevice | null = await getOtherNameById(BigInt(id));

  if (!other_name) {
    return (
      <div className="px-4 flex flex-col">
        Other name not found
        <Link href="/admin/fix_other_names" className="text-blue-500 hover:underline mb-4 inline-block">
          &larr; Back to Other Names List
        </Link>
      </div>
    );
  }

  let possibleVendor = other_name.vendor_name;
  if (possibleVendor === "") {
    possibleVendor = other_name.device_name.split(" ")[0];
  }

  const vendors = await prisma.vendors.findMany({
    where: {
      name: {
        contains: possibleVendor,
        mode: "insensitive" as const,
      },
    },
  });

  return (
    <EditOtherName other_name={other_name} vendors={vendors} />
  );
}
