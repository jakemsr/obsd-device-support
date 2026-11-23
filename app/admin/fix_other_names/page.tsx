import Link from "next/link";
import type { other_device_names } from "@/app/generated/prisma/client";
import { getOtherNamesWithEmptyVendor } from "@/app/admin/fix_other_names/actions";
import { getCurrentUser } from "@/lib/check-user-auth";
import type { AuthUser } from "@/lib/local-types";


export default async function Page() {

  const currentUser: AuthUser | null = await getCurrentUser();

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div>
        <h1>Unauthorized</h1>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  const otherNames: other_device_names[] = await getOtherNamesWithEmptyVendor();

  return (
    <div className="px-4">
      <div className="mb-4 text-2xl font-bold text-center">
        <h1>Fix Other Names</h1>
      </div>
      <div>
        {otherNames.map(({ id, vendor_name, device_name }) => (
          <div key={id.toString()}>
            <Link href={`/admin/fix_other_names/${id.toString()}`}>
              Vendor: {vendor_name} Device: {device_name}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}