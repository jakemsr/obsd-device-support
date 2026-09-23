import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { normalizeDeviceId } from "@/lib/device-ids";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const vendorId = searchParams.get("vendor_id")?.trim();
	const productId = searchParams.get("product_id")?.trim();
	const bus = searchParams.get("bus")?.trim().toUpperCase();

	if (!bus || !vendorId || !productId) {
		return NextResponse.json(
			{ error: "bus, vendor_id, and product_id are required" },
			{ status: 400 }
		);
	}

  let normalizedVendorId;
  let normalizedProductId;
  try {
    normalizedVendorId = normalizeDeviceId(vendorId);
    normalizedProductId = normalizeDeviceId(productId);
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid vendor_id or product_id" },
      { status: 400 }
    );
  }

	if (bus !== "PCI" && bus !== "USB") {
		return NextResponse.json(
			{ error: "bus must be either PCI or USB" },
			{ status: 400 }
		);
	}

  const devices = await prisma.devices.findMany({
		where: {
			product_id: normalizedProductId,
			bus,
			vendors: {
				[bus === "PCI" ? "pci_id" : "usb_id"]: normalizedVendorId,
			},
		},
		include: {
			vendors: true,
			drivers: true,
			other_device_names: true,
		},
		orderBy: { name: "asc" },
	});

	return NextResponse.json({
		bus,
		vendor_id: normalizedVendorId,
		product_id: normalizedProductId,
		matches: devices.map((device) => ({
			vendor: device.vendors.name ?? "",
			device: device.name,
			driver: device.drivers.name,
			support_status: device.support_status,
			other_names: device.other_device_names.map((otherName) => ({
				vendor: otherName.vendor_name,
				device: otherName.device_name,
			})),
		})),
	});
}
