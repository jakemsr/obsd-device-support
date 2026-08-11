import "dotenv/config";
import { readFile } from "node:fs/promises";
import prisma from "../lib/prisma";

type VendorRecord = {
  pcidev: string;
  pci_id: string;
  name: string;
};

function extractVendorFields(text: string): VendorRecord[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("vendor"))
    .map((line) => {
      // Format: vendor <symbolic_name> <pci_id> <vendor_name...>
      const match = line.match(/^vendor\s+(\S+)\s+(\S+)\s+(.+)$/);
      if (!match) {
        return null;
      }

      return {
        pcidev: match[1],
        pci_id: match[2],
        name: match[3].trim(),
      };
    })
    .filter((value): value is VendorRecord => Boolean(value));
}

async function importVendors(filePath: string): Promise<void> {
  const text = await readFile(filePath, "utf8");
  const extracted = extractVendorFields(text);

  // Keep one record per pci_id in case the source has duplicates.
  const deduped = new Map<string, VendorRecord>();
  for (const vendor of extracted) {
    deduped.set(vendor.pci_id, vendor);
  }

  let created = 0;
  let updated = 0;
  let unchanged = 0;

  for (const vendor of deduped.values()) {
    if (vendor.pcidev === "INVALID") {
      continue;
    }
    const existing = await prisma.vendors.findFirst({
      where: { name: vendor.name },
    });

    if (!existing) {
      await prisma.vendors.create({
        data: {
          pcidev: vendor.pcidev,
          pci_id: vendor.pci_id,
          name: vendor.name,
        },
      });
      created += 1;
      continue;
    }

    if ((existing.pcidev ?? "") !== vendor.pcidev) {
      await prisma.vendors.update({
        where: { id: existing.id },
        data: {
          pcidev: vendor.pcidev,
          pci_id: vendor.pci_id,
        },
      });
      updated += 1;
      continue;
    }

    unchanged += 1;

    console.log("Vendor: " + vendor.name + " " + vendor.pcidev + " " + vendor.pci_id);
  }

  console.log(`Parsed: ${extracted.length} vendor lines`);
  console.log(`Unique PCI IDs: ${deduped.size}`);
  console.log(`Created: ${created}`);
  console.log(`Updated: ${updated}`);
  console.log(`Unchanged: ${unchanged}`);
}

const inputPath = process.argv[2] ?? "/usr/src/sys/dev/pci/pcidevs";

importVendors(inputPath)
  .catch((error) => {
    console.error("Vendor import failed:", error);
    process.exitCode = 1;
  })
//  .finally(async () => {
//    await prisma.$disconnect();
//  });
