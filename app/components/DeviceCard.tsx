import type { DeviceWithVendorAndDriver } from "@/lib/local-types";

export default function DeviceCard({ device }: { device: DeviceWithVendorAndDriver }) {
  return (
    <div className="grid grid-cols-4 gap-4 border border-gray-300 rounded p-4 m-4">
      <div className="flex flex-col font-bold">
        <div>Vendor:</div>
        <div>Device:</div>
        <div>Driver:</div>
      </div>
      <div className="flex flex-col">
        <div>{device.vendors?.name}</div>
        <div>{device.name}</div>
        <div><a href={`https://man.openbsd.org/${device.drivers?.name}.4`} target="_blank" rel="noopener noreferrer">{device.drivers?.name}</a></div>
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