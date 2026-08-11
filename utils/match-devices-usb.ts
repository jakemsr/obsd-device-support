import "dotenv/config";
import { readFile } from "node:fs/promises";
import prisma from "../lib/prisma";

const usbdevsPath = "/usr/src/sys/dev/usb/usbdevs";

const driverPath = "/usr/src/sys/dev/usb/if_mtw.c";
const driverName = "mtw";
const driverDevType = "network/wireless";
const driverBus = "USB";
const driverMatch = "USB_ID";

type DeviceRecord = {
  vendor_dev: string;
  device_dev: string;
};

function extractDeviceFields(text: string): DeviceRecord[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => new RegExp(`^\\s*USB_ID\\(`).test(line))
    .map((line) => {
      const match = line.match(new RegExp(`^\\s*USB_ID\\((\\S+),\\s+(\\S+)\\),?\\s*$`));
      if (!match) {
        return null;
      }

      return {
        vendor_dev: match[1],
        device_dev: match[2],
      };
    })
    .filter((value): value is DeviceRecord => Boolean(value));
}

async function findUsbdev(vendor_dev: string, device_dev: string, usbdevsText: string, driverId: bigint): Promise<void> {
  const regex = new RegExp(`^product\\s+${vendor_dev}\\s+${device_dev}\\s+(\\S+)\\s+(.+)`, 'm');
  const match = usbdevsText.match(regex);
  if (match) {
    console.log(`USB device found: ${match[1]} ${match[2]}`);
    const deviceDevId = match[1];
    const deviceName = match[2];
/*
    const vendor = await prisma.vendors.findFirst({
      where: { usbdev: vendor_dev },
    });
    if (vendor) {
      console.log(`USB vendor found: ${vendor.id} ${vendor.name}`);
    } else {
      throw new Error(`USB vendor not found for usbdev: ${vendor_dev}`);
    }

    const existing = await prisma.devices.findFirst({
      where: {
        dev_id: deviceDevId,
        vendor_id: vendor.id,
      },
    });
    if (!existing) {
      await prisma.devices.create({
        data: {
          dev_id: deviceDevId,
          devs_name: device_dev,
          name: deviceName,
          vendor_id: vendor.id,
          driver_id: driverId,
          bus: driverBus ?? null,
        },
      });
      console.log(`Device created: ${deviceDevId} ${deviceName}\n`);
    } else {
      console.log(`Device already exists: ${existing.dev_id} ${existing.name}!!!\n`);
    }
*/
  } else {
    throw new Error(`USB device not found: ${vendor_dev} ${device_dev}`);
  }
}

async function importDevices(filePath: string, driverId: bigint): Promise<void> {
  let text;
  try {
    text = await readFile(filePath, "utf8");
  } catch (e) {
    console.log(error.message);
    process.exit(-1);
  }
  const extracted = extractDeviceFields(text);

  const usbdevsText = await readFile(usbdevsPath, "utf8");

  for (const device of extracted) {
//  for (let i = 0; i < Math.min(extracted.length, 10); i++) {
//    const device = extracted[i];
//    console.log(`Device: ${device.vendor_dev} ${device.device_dev}`);
    try {
      await findUsbdev(device.vendor_dev, device.device_dev, usbdevsText, driverId);
    } catch (error) {
      console.error(`Failed to add USB device: ${device.vendor_dev} ${device.device_dev}`, error);
    }
  }
}


async function importDriver(): Promise<void> {
  let driverId: bigint | undefined;

  // Implementation for importing the driver goes here
  const existingDriver = await prisma.drivers.findFirst({
    where: { name: driverName },
  });
  if (!existingDriver) {
    const driver = await prisma.drivers.create({
      data: {
        name: driverName,
        dev_type: driverDevType,
      },
    });
    console.log(`Driver created: ${driver.id} ${driver.name}`);
    driverId = driver.id;
  } else {
    console.log(`Driver already exists: ${existingDriver.id} ${existingDriver.name}`);
    driverId = existingDriver.id;
  }

  importDevices(driverPath, driverId)
      .catch((error) => {
        console.error("Device import failed:", error);
        process.exitCode = 1;
      })
      .finally(async () => {
        await prisma.$disconnect();
      });
}


importDriver()
  .catch((error) => {
    console.error("Driver import failed:", error);
    process.exitCode = 1;
  });
