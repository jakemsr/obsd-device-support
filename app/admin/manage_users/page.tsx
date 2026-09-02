import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { User } from "@/app/generated/prisma/client";


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

  const users = await prisma.user.findMany({
    orderBy: [
      { role: "asc" },
      { email: "asc" },
    ],
  });

  const userCount = await prisma.user.count();

  const userEntry = (user: User, index: number) => {
    return (
      <Link
        key={index}
        href={`/admin/manage_users/${user.id}`}
        className="grid grid-cols-2 gap-2 sm:grid-cols-9 sm:gap-4 text-link hover:underline border-t border-foreground"
      >
        <div className="col-auto sm:col-span-3">{user.email}</div>
        <div className="col-auto sm:col-span-2">{user.firstName} {user.lastName}</div>
        <div className="col-auto sm:col-span-1">{user.role}</div>
        <div className="col-auto sm:col-span-3">{user.createdAt.toISOString()}</div>
      </Link>
    );
  };

  return (
    <div className="m-4">
      <h1 className="text-2xl font-bold mb-4">
        User Management
      </h1>
      <p className="mb-4">
        There are {userCount} users in the system.
      </p>
      <div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-9 sm:gap-4">
          <div className="font-bold col-auto sm:col-span-3">Email</div>
          <div className="font-bold col-auto sm:col-span-2">Name</div>
          <div className="font-bold col-auto sm:col-span-1">Role</div>
          <div className="font-bold col-auto sm:col-span-3">Created At</div>
        </div>
        {users.map((user, index) => userEntry(user, index))}

      </div>
    </div>

  );
}