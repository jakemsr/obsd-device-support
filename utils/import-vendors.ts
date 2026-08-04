import "dotenv/config";
import { readFile } from "node:fs/promises";
import prisma from "../lib/prisma";

type VendorRecord = {
  usbdev: string;
  usb_id: string;
  name: string;
};

function extractVendorFields(text: string): VendorRecord[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("vendor"))
    .map((line) => {
      // Format: vendor <symbolic_name> <usb_id> <vendor_name...>
      const match = line.match(/^vendor\s+(\S+)\s+(\S+)\s+(.+)$/);
      if (!match) {
        return null;
      }

      return {
        usbdev: match[1],
        usb_id: match[2],
        name: match[3].trim(),
      };
    })
    .filter((value): value is VendorRecord => Boolean(value));
}

async function importVendors(filePath: string): Promise<void> {
  const text = await readFile(filePath, "utf8");
  const extracted = extractVendorFields(text);

  // Keep one record per usb_id in case the source has duplicates.
  const deduped = new Map<string, VendorRecord>();
  for (const vendor of extracted) {
    deduped.set(vendor.usb_id, vendor);
  }

  let created = 0;
  let updated = 0;
  let unchanged = 0;

  for (const vendor of deduped.values()) {
    const existing = await prisma.vendors.findFirst({
      where: { usb_id: vendor.usb_id },
    });

    if (!existing) {
      await prisma.vendors.create({
        data: {
          usbdev: vendor.usbdev,
          usb_id: vendor.usb_id,
          name: vendor.name,
        },
      });
      created += 1;
      continue;
    }

    if ((existing.usbdev ?? "") !== vendor.usbdev) {
      await prisma.vendors.update({
        where: { id: existing.id },
        data: { usbdev: vendor.usbdev },
      });
      updated += 1;
      continue;
    }

    unchanged += 1;
  }

  console.log(`Parsed: ${extracted.length} vendor lines`);
  console.log(`Unique USB IDs: ${deduped.size}`);
  console.log(`Created: ${created}`);
  console.log(`Updated: ${updated}`);
  console.log(`Unchanged: ${unchanged}`);
}

const inputPath = process.argv[2] ?? "C:/Users/jakem/Downloads/usbdevs.txt";

importVendors(inputPath)
  .catch((error) => {
    console.error("Vendor import failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });