import prisma from "@/lib/prisma";
import EditUserButton from "@/app/components/admin/EditUserButton";
import { User } from "@/app/generated/prisma/client";
import { getCurrentUser } from "@/lib/check-user-auth";
import type { AuthUser } from "@/lib/local-types";


interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  const currentUser: AuthUser | null = await getCurrentUser();

  if (!currentUser || currentUser.role !== "admin") {
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

  const user: User | null = await prisma.user.findUnique({
    where: { id: id },
  });

  return (
    <div className="m-4">
      <h1 className="text-2xl font-bold mb-4">
        User Management
      </h1>
      <p className="mb-4">
        Viewing user with ID: {id}
      </p>
      {user ? (
        <div>
          <div className="grid grid-cols-2 gap-2 max-w-fit">
            <div className="font-bold">Name</div>
            <div>{user.firstName} {user.lastName}</div>
            <div className="font-bold">Email</div>
            <div>{user.email}</div>
            <div className="font-bold">Role</div>
            <div>{user.role}</div>
            <div className="font-bold">Created At</div>
            <div>{user.createdAt.toISOString()}</div>
            <div className="font-bold">Updated At</div>
            <div>{user.updatedAt.toISOString()}</div>
          </div>
          <div className="mt-4">
            <EditUserButton user={user}/>
          </div>
        </div>
      ) : (
        <p>User not found.</p>
      )}
    </div>
  );
}
