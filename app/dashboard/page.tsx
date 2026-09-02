import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";


export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session || !session.user) {
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

  const actions = session.user.role === "admin" ?
    [
      { "manage users": "/admin/manage_users" },
      { "manage content": "/admin/manage_content" }
    ] : [
      { "view submissions": "/submissions" }
    ];

  return (
    <div className="m-4">
      <h1>
        Dashboard
      </h1>
      <div>
        Welcome, {session.user?.name || session.user?.email}!
      </div>
      <div>
        Actions:
        <ul className="list-disc list-inside">
          {actions.map(action => (
            <li
              key={Object.keys(action)[0]}
              className="text-link hover:underline"
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