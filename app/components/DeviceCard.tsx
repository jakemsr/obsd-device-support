import Link from "next/link";
import type { DeviceWithVendorAndDriver } from "@/lib/local-types";

export default function DeviceCard({ device }: { device: DeviceWithVendorAndDriver }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border border-gray-300 rounded p-4 m-4">
      <div className="flex flex-col font-bold">
        <div>Vendor:</div>
        <div>Device:</div>
        <div>Driver:</div>
      </div>
      <div className="flex flex-col">
        <div>{device.vendors?.name}</div>
        <div>{device.name}</div>
        <div>
          <Link
            href={`https://man.openbsd.org/${device.drivers?.name}.4`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-600 hover:underline"
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
      <div className="flex flex-col font-bold">
        <div>Bus:</div>
        <div>Vendor ID:</div>
        <div>Device ID:</div>
      </div>
      <div className="flex flex-col">
        <div>{device.bus}</div>
        <div>{device.bus === "PCI" ? device.vendors.pci_id : (device.bus === "USB" ? device.vendors.usb_id : "")}</div>
        <div>{device.dev_id}</div>
      </div>
    </div>
  );
}
