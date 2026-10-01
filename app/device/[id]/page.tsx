import { Suspense } from "react";
import Link from "next/link";
import DeviceCard from "@/app/components/device/DeviceCard";
import { LinkButton } from "@/app/components/Button";
import { getCurrentUser } from "@/lib/check-user-auth";


export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const currentUser = await getCurrentUser();

  return (
    <div className="px-4 py-4 sm:px-8">
      <div>
        <h1 className="text-2xl font-bold text-center mb-4">
          Device {id}
        </h1>
      </div>
      <Suspense fallback={<div>Loading device information...</div>}>
        <DeviceCard id={id} />
      </Suspense>

      {currentUser && (
      <div className="w-fit mt-4">
        <Link href={`/reports/submit?deviceId=${id}`}>
          <LinkButton>
            Submit Report for Device {id}
          </LinkButton>
        </Link>
      </div>
      )}

    </div>
  );
}
