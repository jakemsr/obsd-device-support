import Link from "next/link";
import { getCurrentUser } from "@/lib/check-user-auth";
import type { AuthUser } from "@/lib/local-types";


export default async function Page() {

  const currentUser: AuthUser | null = await getCurrentUser();

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh">
        <h1>
          Dashboard
        </h1>
        <p>
          You must be logged in to view this page.
        </p>
      </div>
    )
  }

  type Action = {
    [key: string]: string;
  };

  const actions: Action[] = currentUser.role === "admin" ?
    [
      { "manage users": "/admin/manage_users" },
      { "manage content": "/admin/manage_content" }
    ] : [
      { "submit report": "/reports/submit" },
      { "view reports": "/reports" }
    ];

  if (currentUser.role === "editor") {
    actions.push({ "view reviews": "/report-reviews" });
  }

  return (
    <div className="px-4 py-4 sm:px-8">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Dashboard
      </h1>
      <div>
        Welcome, {currentUser.name || currentUser.email}!
      </div>
      <div className="mt-4">
        Actions:
        <ul className="list-disc list-inside">
          {actions.map(action => (
            <li
              key={Object.keys(action)[0]}
              className="px-4 text-link hover:underline"
            >
              <Link href={Object.values(action)[0]}>
                {Object.keys(action)[0]}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}