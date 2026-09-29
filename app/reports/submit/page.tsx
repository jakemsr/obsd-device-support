import { Suspense } from 'react';
import SubmitReport from '@/app/components/reports/SubmitReport';
import prisma from '@/lib/prisma';
import { getUserId } from '@/lib/check-user-auth';
import { FullDeviceInfo } from '@/lib/local-types';


interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Page({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;

  const deviceId = resolvedParams.deviceId;

  let devicePromise: Promise<FullDeviceInfo | null> = Promise.resolve(null);
  if (deviceId && typeof deviceId === 'string') {
    devicePromise = prisma.devices.findUnique({
      where: {
        id: BigInt(deviceId),
      },
      include: {
        drivers: true,
        vendors: true,
        issues: true,
        other_device_names: true
      }
    });
  }

  const userIdPromise = getUserId();

  return (
    <div className="px-4 py-4 sm:px-8">

      <h1 className="text-2xl font-bold text-center mb-4">
        Submit Report for Device {deviceId}
      </h1>

      <Suspense fallback={<div>Loading report form...</div>}>
        <SubmitReport userIdPromise={userIdPromise} devicePromise={devicePromise} />
      </Suspense>

    </div>
  );
}
