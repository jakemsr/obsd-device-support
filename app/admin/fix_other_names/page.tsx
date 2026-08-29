import Link from "next/link";
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getOtherNames, OtherName } from "./actions";


export default async function Page() {

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

  const otherNames: OtherName[] = await getOtherNames();

  return (
    <div className="px-4">
      <div className="mb-4 text-2xl font-bold text-center">
        <h1>Fix Other Names</h1>
      </div>
      <div>
        {otherNames.filter(otherName => otherName.vendor_name === "").map(({ id, vendor_name, device_name }) => (
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