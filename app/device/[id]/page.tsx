import { Suspense } from "react";
import Link from "next/link";
import DeviceCard from "@/app/components/device/DeviceCard";
import { LinkButton } from "@/app/components/Button";


export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <>
      <Suspense fallback={<div className="p-4">Loading device information...</div>}>
        <DeviceCard id={id} />
      </Suspense>

      <div className="py-4 px-4 sm:px-8 w-fit">
        <Link href={`/reports/submit?deviceId=${id}`}>
          <LinkButton>
            Submit Report for Device {id}
          </LinkButton>
        </Link>
      </div>
    </>
  );
}
