import { Suspense } from "react";
import DeviceCard from "@/app/components/DeviceCard";


export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <Suspense fallback={<div className="p-4">Loading device information...</div>}>
      <DeviceCard id={id} />
    </Suspense>
  );
}
