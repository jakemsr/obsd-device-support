import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
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

  const users = await prisma.user.findMany({
    orderBy: [
      { email: "asc" },
    ],
  });

  const userCount = await prisma.user.count();

  const userEntry = (user: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: Date;
  }, index: number) => {
    return (
      <Link
        key={index}
        href={`/admin/manage_users/${user.id}`}
        className="grid grid-cols-4 gap-4 text-link hover:underline"
      >
        <div>{user.name}</div>
        <div>{user.email}</div>
        <div>{user.role}</div>
        <div>{user.createdAt.toISOString()}</div>
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
        <div className="grid grid-cols-4 gap-4">
          <div className="font-bold">Name</div>
          <div className="font-bold">Email</div>
          <div className="font-bold">Role</div>
          <div className="font-bold">Created At</div>
        </div>
        {users.map((user, index) => userEntry(user, index))}

      </div>
    </div>

  );
}