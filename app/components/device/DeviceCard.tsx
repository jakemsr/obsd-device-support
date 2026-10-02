import prisma from "@/lib/prisma";
import Link from "next/link";
import type { FullDeviceInfo } from "@/lib/local-types";


export default async function DeviceCard({ id }: { id: string }) {

  type Support = {
    words: string;
    color: string;
  };

  const support: { [key: string]: Support } = {
    "supported": {
      words: "Supported",
      color: "text-supported",
    },
    "partial": {
      words: "Partially Supported",
      color: "text-partial"
    },
    "unsupported": {
      words: "Unsupported",
      color: "text-unsupported"
    },
    "unknown": {
      words: "Unknown",
      color: "text-unknown"
    },
    "likely": {
      words: "Likely Supported",
      color: "text-likely"
    },
  };

  const device: FullDeviceInfo | null = await prisma.devices.findUnique({
    where: { id: BigInt(id) },
    include: {
      vendors: true,
      drivers: true,
      issues: true,
      other_device_names: true,
    },
  });

  if (!device) {
    return (
      <div>
        Device not found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 gap-x-16 max-w-fit">
      <div className="grid grid-cols-3 gap-x-2">
        <div className="font-bold">
          Vendor:
        </div>
        <div className="col-span-2">
          {device.vendors?.name}
        </div>
        <div className="font-bold">
          Product:
        </div>
        <div className="col-span-2">
          {device.name}
        </div>
        <div className="font-bold">
          Driver:
        </div>
        <div className="col-span-2">
          <Link
            href={`https://man.openbsd.org/${device.drivers?.name}.4`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-link hover:underline"
          >
            <span>{device.drivers?.name}</span>
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.5 4.5H15.5V12.5M15.5 4.5L4.5 15.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-x-2">
        <div className="font-bold">
          Bus:
        </div>
        <div className="col-span-2">
          {device.bus}
        </div>
        <div className="font-bold">
          Vendor ID:
        </div>
        <div className="col-span-2">
          {device.bus === "PCI" ? device.vendors?.pci_id ?? "" : device.vendors?.usb_id ?? ""}
        </div>
        <div className="font-bold">
          Product ID:
        </div>
        <div className="col-span-2">
          {device.product_id}
        </div>
      </div>

      <div className="col-span-1 sm:col-span-2">
        <span className="font-bold">
          Support Status:&nbsp;
        </span>
        <span className={`
          ${support[device.support_status].color}
        `}>
          {support[device.support_status].words}
        </span>
      </div>

      <div className="col-span-1 sm:col-span-2">
        <div className="font-bold">
          Known Issues:
        </div>
        <div className="px-4">
          {device.issues.length === 0 ? (
            <span>No known issues</span>
          ) : (
          device.issues.map(issue => (
            <div
              key={issue.id}
              className="mb-2"
            >
              {issue.description}
            </div>
          )))}
        </div>
      </div>

      <div className="col-span-1 sm:col-span-2">
        <div className="font-bold">
          Products using this VID/PID:
        </div>
        <div className="px-4">
          {device.other_device_names.length === 0 ? (
            <span>No known other names</span>
          ) : (
          device.other_device_names.map((otherName, index) => (
            <div
              key={otherName.id}
              className="mb-2"
            >
              {otherName.vendor_name} {otherName.device_name}
            </div>
          )))}
        </div>
      </div>
    </div>
  );
}
