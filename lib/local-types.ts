import type { Prisma } from "@/app/generated/prisma/client";
import { auth } from "@/lib/auth";

export type AuthSession = NonNullable<
  Awaited<ReturnType<typeof auth.api.getSession>>
>;

export type AuthSessionPromise = Promise<AuthSession | null>;

export type FullDeviceInfo = Prisma.devicesGetPayload<{
  include: {
    vendors: true;
    drivers: true;
    issues: true;
    other_device_names: true;
  },
}>;

export type DeviceListEntryProps = {
  id: bigint;
  name: string;
  devType: string;
  bus: string;
  vid: string;
  pid: string;
}

export type ReportWithRelations = Prisma.reportsGetPayload<{
  include: {
    sources: true;
    reported_devices: true;
  };
}>;

export type FullReport = Prisma.reportsGetPayload<{
  include: {
    sources: {
      include: {
        hwinspect_report: true;
        form_report: true;
      };
    };
    reported_devices: {
      include: {
        reported_issues: true;
        reported_other_device_names: true;
      };
    };
  };
}>;

export type UpdateRoleState = {
  error: string
  success: boolean
  message: string
};

const updateRoleInitialState: UpdateRoleState = {
  error: '',
  success: false,
  message: '',
};
export { updateRoleInitialState };
