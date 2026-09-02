
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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

	if (bus && bus !== "PCI" && bus !== "USB") {
		return NextResponse.json(
			{ error: "bus must be either PCI or USB" },
			{ status: 400 }
		);
	}

  const devices = await prisma.devices.findMany({
		where: {
			product_id: productId,
			bus,
			vendors: {
				[bus === "PCI" ? "pci_id" : "usb_id"]: vendorId,
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
		vendor_id: vendorId,
		product_id: productId,
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
