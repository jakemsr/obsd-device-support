import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";


export default async function Page() {

  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session || !session.user || session.user.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh">
        <h1>
          Access Denied
        </h1>
        <p>
          You must be an admin to view this page.
        </p>
      </div>
    );
  }

  return (
    <div className="m-4">
      <h1 className="text-2xl font-bold mb-4">
        Content Management
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/admin/fix_other_names" className="text-link hover:underline">
          Fix Other Names
        </Link>
      </div>
    </div>
  );
}
