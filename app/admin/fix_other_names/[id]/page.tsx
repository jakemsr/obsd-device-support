import Link from "next/link";
import { headers } from 'next/headers';
import prisma from "@/lib/prisma";
import { auth } from '@/lib/auth';
import EditOtherName from "@/app/components/admin/EditOtherName";
import { getOtherNameById, OtherNameWithDevice } from "../actions";


export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user || session.user.role !== 'admin') {
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
