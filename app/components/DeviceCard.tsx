import Link from "next/link";
import type { DeviceWithVendorAndDriver } from "@/lib/local-types";

export default function DeviceCard({ device }: { device: DeviceWithVendorAndDriver }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-gray-300 rounded p-4 m-4">
      <div>
        <div className="grid grid-cols-2">
          <div className="font-bold">Vendor:</div>
          <div>{device.vendors?.name}</div>
        </div>
        <div className="grid grid-cols-2">
          <div className="font-bold">Device:</div>
          <div>{device.name}</div>
        </div>
        <div className="grid grid-cols-2">
          <div className="font-bold">Driver:</div>
          <div>
            <Link
              href={`https://man.openbsd.org/${device.drivers?.name}.4`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-700 dark:text-blue-400 hover:underline"
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
      </div>

      <div>
        <div className="grid grid-cols-2">
          <div className="font-bold">Bus:</div>
          <div>{device.bus}</div>
        </div>
        <div className="grid grid-cols-2">
          <div className="font-bold">Vendor ID:</div>
          <div>{device.vendors?.pci_id ?? device.vendors?.usb_id ?? ""}</div>
        </div>
        <div className="grid grid-cols-2">
          <div className="font-bold">Device ID:</div>
          <div>{device.dev_id}</div>
        </div>
      </div>
    </div>
  );
}
