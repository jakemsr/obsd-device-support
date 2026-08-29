"use client";

import { OtherNameWithDevice } from "@/app/admin/fix_other_names/actions";
import Link from "next/link";
import { useState } from "react";


interface EditOtherNameProps {
  other_name: OtherNameWithDevice;
  vendors: { id: bigint, name: string | null, pci_id: string | null, usb_id: string | null }[];
}

export default function EditOtherName({ other_name, vendors }: EditOtherNameProps) {

  let tryVendorName = other_name.vendor_name;
  let tryDeviceName = other_name.device_name;
  if (tryVendorName === "") {
    const possibleVendor = other_name.device_name.split(" ")[0];
    for (const vendor of vendors) {
      if (vendor.name?.toLowerCase().includes(possibleVendor.toLowerCase()) &&
        ((other_name.devices.bus === "USB" && vendor.usb_id) ||
          (other_name.devices.bus === "PCI" && vendor.pci_id))) {
        tryVendorName = vendor.name;
        tryDeviceName = other_name.device_name.split(" ").slice(1).join(" ");
        break;
      }
    }
  }

  const [vendorName, setVendorName] = useState(tryVendorName);
  const [deviceName, setDeviceName] = useState(tryDeviceName);
  const [deleteEntry, setDeleteEntry] = useState(false);

  const [apiResponse, setApiResponse] = useState<any>(null);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Send the POST request to the custom API endpoint
    const response = await fetch(`/api/admin/fix_other_names/${other_name.id}/edit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        {
          vendor_name: vendorName,
          device_name: deviceName,
          delete_entry: deleteEntry,
          id: other_name.id.toString()
        }),
    });

    // Unpack the response from the API route
    const data = await response.json();
    setApiResponse(data);
  };


  return (
    <div className="px-4">
      <Link href="/admin/fix_other_names" className="text-blue-500 hover:underline mb-4 inline-block">
        &larr; Back to Other Names List
      </Link>
      <h1 className="text-center text-xl font-bold mb-4">Edit Other Name</h1>
      <p>ID: {other_name.id.toString()}</p>
      <p>Vendor: {other_name.vendor_name}</p>
      <p>Device: {other_name.device_name}</p>
      <p>-----------</p>
      <p>Canonical device: {other_name.devices.vendors.name} {other_name.devices.name}</p>
      <p>Bus: {other_name.devices.bus}</p>
      <form
        className="flex flex-col justify-start gap-2 mt-4"
        onSubmit={handleSubmit}
      >
        <label>
          Vendor Name:
          <input
            type="text"
            name="vendor_name"
            value={vendorName}
            onChange={(e) => setVendorName(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1"
          />
        </label>
        <label>
          Device Name:
          <input
            type="text"
            name="device_name"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1"
          />
        </label>
        <label>
          Delete this entry:
          <input
            type="checkbox"
            name="delete_entry"
            checked={deleteEntry}
            onChange={(e) => setDeleteEntry(e.target.checked)}
          />
        </label>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded mt-2 w-20"
        >
          Update
        </button>
      </form>

      {apiResponse ? (
        <div className="mt-5 p-2">
          <h3>Response from API Route:</h3>
          <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
        </div>
      ) : (
        <div>
          <h2 className="text-lg font-bold mt-4">Possible Vendors</h2>
          <ul>
            {vendors.filter(vendor => (other_name.devices.bus === "USB" && vendor.usb_id) || (other_name.devices.bus === "PCI" && vendor.pci_id)).map((vendor) => (
              <li key={vendor.id}>"{vendor.name}" PCI ID: {vendor.pci_id ?? "null"} USB ID: {vendor.usb_id ?? "null"}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
