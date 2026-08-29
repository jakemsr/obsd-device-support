import "dotenv/config";
import { readFile } from "node:fs/promises";
import prisma from "../lib/prisma";


const driverConfig = {
  mtw:
  {
    name: "mtw",
    devType: "network/wireless",
    bus: "USB",
    filter: "^\\s*USB_ID\\(",
    match: "^\\s*USB_ID\\((\\S+),\\s+(\\S+)\\),?\\s*$",
    path: "/usr/src/sys/dev/usb/if_mtw.c",
    removeVendor: false,
  },
  atu:
  {
    name: "atu",
    devType: "network/wireless",
    bus: "USB",
    filter: "^\\s*{\\s*USB_VENDOR_\\S+\\s*,\\s*USB_PRODUCT_\\S+\\s*}\\s*,?\\s*$",
    match: "^\\s*{\\s*USB_VENDOR_(\\S+)\\s*,\\s*USB_PRODUCT_(\\S+)\\s*}\\s*,?\\s*$",
    path: "/usr/src/sys/dev/usb/if_atu.c",
    removeVendor: true,
  },
  bwfm_usb:
  {
    name: "bwfm",
    devType: "network/wireless",
    bus: "USB",
    filter: `^\\s*{\\s*USB_VENDOR_\\S+\\s*,\\s*USB_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*USB_VENDOR_(\\S+)\\s*,\\s*USB_PRODUCT_(\\S+)\\s*},?`,
    path: "/usr/src/sys/dev/usb/if_bwfm_usb.c",
    removeVendor: true,
  },
  otus:
  {
    name: "otus",
    devType: "network/wireless",
    bus: "USB",
    filter: `^\\s*{\\s*USB_VENDOR_\\S+\\s*,\\s*USB_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*USB_VENDOR_(\\S+)\\s*,\\s*USB_PRODUCT_(\\S+)\\s*},?`,
    path: "/usr/src/sys/dev/usb/if_otus.c",
    removeVendor: true,
  },
  ural:
  {
    name: "ural",
    devType: "network/wireless",
    bus: "USB",
    filter: `^\\s*{\\s*USB_VENDOR_\\S+\\s*,\\s*USB_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*USB_VENDOR_(\\S+)\\s*,\\s*USB_PRODUCT_(\\S+)\\s*},?`,
    path: "/usr/src/sys/dev/usb/if_ral.c",
    removeVendor: true,
  },
  rsu:
  {
    name: "rsu",
    devType: "network/wireless",
    bus: "USB",
    filter: `^\\s*{\\s*USB_VENDOR_\\S+\\s*,\\s*USB_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*USB_VENDOR_(\\S+)\\s*,\\s*USB_PRODUCT_(\\S+)\\s*},?`,
    path: "/usr/src/sys/dev/usb/if_rsu.c",
    removeVendor: true,
  },
  rum:
  {
    name: "rum",
    devType: "network/wireless",
    bus: "USB",
    filter: `^\\s*{\\s*USB_VENDOR_\\S+\\s*,\\s*USB_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*USB_VENDOR_(\\S+)\\s*,\\s*USB_PRODUCT_(\\S+)\\s*},?`,
    path: "/usr/src/sys/dev/usb/if_rum.c",
    removeVendor: true,
  },
  uath:
  {
    name: "uath",
    devType: "network/wireless",
    bus: "USB",
    filter: "^\\s*UATH_DEV_U.\\(",
    match: "^\\s*UATH_DEV_U.\\((\\S+),\\s+(\\S+)\\),?\\s*$",
    path: "/usr/src/sys/dev/usb/if_uath.c",
    removeVendor: false,
  },
  upgt:
  {
    name: "upgt",
    devType: "network/wireless",
    bus: "USB",
    filter: `^\\s*{\\s*USB_VENDOR_\\S+\\s*,\\s*USB_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*USB_VENDOR_(\\S+)\\s*,\\s*USB_PRODUCT_(\\S+)\\s*},?`,
    path: "/usr/src/sys/dev/usb/if_upgt.c",
    removeVendor: true,
  },
  urtw:
  {
    name: "urtw",
    devType: "network/wireless",
    bus: "USB",
    filter: "^\\s*URTW_DEV_RTL8187B?\\(",
    match: "^\\s*URTW_DEV_RTL8187B?\\((\\S+),\\s+(\\S+)\\),?\\s*$",
    path: "/usr/src/sys/dev/usb/if_urtw.c",
    removeVendor: false,
  },
  wi_usb:
  {
    name: "wi",
    devType: "network/wireless",
    bus: "USB",
    filter: `^\\s*{{\\s*USB_VENDOR_\\S+\\s*,\\s*USB_PRODUCT_\\S+\\s*},`,
    match: `^\\s*{{\\s*USB_VENDOR_(\\S+)\\s*,\\s*USB_PRODUCT_(\\S+)\\s*},`,
    path: "/usr/src/sys/dev/usb/if_wi_usb.c",
    removeVendor: true,
  },
  zyd:
  {
    name: "zyd",
    devType: "network/wireless",
    bus: "USB",
    filter: "^\\s*ZYD_ZD1211B?_DEV\\(",
    match: "^\\s*ZYD_ZD1211B?_DEV\\((\\S+),\\s+(\\S+)\\),?\\s*$",
    path: "/usr/src/sys/dev/usb/if_zyd.c",
    removeVendor: false,
  },
  aue:
  {
    name: "aue",
    devType: "network/wired",
    bus: "USB",
    filter: `^\\s*{{\\s*USB_VENDOR_\\S+\\s*,\\s*USB_PRODUCT_\\S+\\s*},`,
    match: `^\\s*{{\\s*USB_VENDOR_(\\S+)\\s*,\\s*USB_PRODUCT_([^\\s}]*)\\s*},`,
    path: "/usr/src/sys/dev/usb/if_aue.c",
    removeVendor: true,
  },
  axe:
  {
    name: "axe",
    devType: "network/wired",
    bus: "USB",
    filter: `^\\s*{\\s*{\\s*USB_VENDOR_\\S+\\s*,\\s*USB_PRODUCT_\\S+\\s*},`,
    match: `^\\s*{\\s*{\\s*USB_VENDOR_(\\S+)\\s*,\\s*USB_PRODUCT_([^\\s}]*)\\s*},`,
    path: "/usr/src/sys/dev/usb/if_axe.c",
    removeVendor: true,
  },
  axen:
  {
    name: "axen",
    devType: "network/wired",
    bus: "USB",
    filter: `^\\s*{\\s*{\\s*USB_VENDOR_\\S+\\s*,\\s*USB_PRODUCT_\\S+\\s*}, AX179`,
    match: `^\\s*{\\s*{\\s*USB_VENDOR_(\\S+)\\s*,\\s*USB_PRODUCT_([^\\s}]*)\\s*},`,
    path: "/usr/src/sys/dev/usb/if_axen.c",
    removeVendor: true,
  },
  cdce:
  {
    name: "cdce",
    devType: "network/wired",
    bus: "USB",
    filter: `^\\s*{\\s*{\\s*USB_VENDOR_\\S+\\s*,\\s*USB_PRODUCT_\\S+\\s*},`,
    match: `^\\s*{\\s*{\\s*USB_VENDOR_(\\S+)\\s*,\\s*USB_PRODUCT_([^\\s}]*)\\s*},`,
    path: "/usr/src/sys/dev/usb/if_cdce.c",
    removeVendor: true,
  },
  cue:
  {
    name: "cue",
    devType: "network/wired",
    bus: "USB",
    filter: `^\\s*{\\s*USB_VENDOR_\\S+\\s*,\\s*USB_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*USB_VENDOR_(\\S+)\\s*,\\s*USB_PRODUCT_(\\S+)\\s*},?`,
    path: "/usr/src/sys/dev/usb/if_cue.c",
    removeVendor: true,
  },
  kue:
  {
    name: "kue",
    devType: "network/wired",
    bus: "USB",
    filter: `^\\s*{\\s*USB_VENDOR_\\S+\\s*,\\s*USB_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*USB_VENDOR_(\\S+)\\s*,\\s*USB_PRODUCT_(\\S+)\\s*},?`,
    path: "/usr/src/sys/dev/usb/if_kue.c",
    removeVendor: true,
  },
  mos:
  {
    name: "mos",
    devType: "network/wired",
    bus: "USB",
    filter: `^\\s*{\\s*{\\s*USB_VENDOR_\\S+\\s*,\\s*USB_PRODUCT_\\S+\\s*},`,
    match: `^\\s*{\\s*{\\s*USB_VENDOR_(\\S+)\\s*,\\s*USB_PRODUCT_([^\\s}]*)\\s*},`,
    path: "/usr/src/sys/dev/usb/if_mos.c",
    removeVendor: true,
  },
  smsc:
  {
    name: "smsc",
    devType: "network/wired",
    bus: "USB",
    filter: `^\\s*{\\s*USB_VENDOR_\\S+\\s*,\\s*USB_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*USB_VENDOR_(\\S+)\\s*,\\s*USB_PRODUCT_(\\S+)\\s*},?`,
    path: "/usr/src/sys/dev/usb/if_smsc.c",
    removeVendor: true,
  },
  uaq:
  {
    name: "uaq",
    devType: "network/wired",
    bus: "USB",
    filter: `^\\s*{\\s*USB_VENDOR_\\S+\\s*,\\s*USB_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*USB_VENDOR_(\\S+)\\s*,\\s*USB_PRODUCT_(\\S+)\\s*},?`,
    path: "/usr/src/sys/dev/usb/if_uaq.c",
    removeVendor: true,
  },
  udav:
  {
    name: "udav",
    devType: "network/wired",
    bus: "USB",
    filter: `^\\s*{\\s*{\\s*USB_VENDOR_\\S+\\s*,\\s*USB_PRODUCT_\\S+\\s*},`,
    match: `^\\s*{\\s*{\\s*USB_VENDOR_(\\S+)\\s*,\\s*USB_PRODUCT_([^\\s}]*)\\s*},`,
    path: "/usr/src/sys/dev/usb/if_udav.c",
    removeVendor: true,
  },
  ure:
  {
    name: "ure",
    devType: "network/wired",
    bus: "USB",
    filter: `^\\s*{\\s*USB_VENDOR_\\S+\\s*,\\s*USB_PRODUCT_\\S+\\s*},?`,
    match: `^\\s*{\\s*USB_VENDOR_(\\S+)\\s*,\\s*USB_PRODUCT_(\\S+)\\s*},?`,
    path: "/usr/src/sys/dev/usb/if_ure.c",
    removeVendor: true,
  },
  url:
  {
    name: "url",
    devType: "network/wired",
    bus: "USB",
    filter: `^\\s*{\\s*{\\s*USB_VENDOR_\\S+\\s*,\\s*USB_PRODUCT_\\S+\\s*},`,
    match: `^\\s*{\\s*{\\s*USB_VENDOR_(\\S+)\\s*,\\s*USB_PRODUCT_([^\\s}]*)\\s*},`,
    path: "/usr/src/sys/dev/usb/if_url.c",
    removeVendor: true,
  },
};

const currDriver = "url";

const deviceDevsPath = driverConfig[currDriver].bus === "USB" ?
  "/usr/src/sys/dev/usb/usbdevs" : "/usr/src/sys/dev/pci/pcidevs";

type DeviceRecord = {
  vendor_dev: string;
  device_dev: string;
};

function extractDeviceFields(text: string): DeviceRecord[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => new RegExp(driverConfig[currDriver].filter).test(line))
    .map((line) => {
      const match = line.match(new RegExp(driverConfig[currDriver].match));
      if (!match) {
        return null;
      }

      return {
        vendor_dev: match[1],
        device_dev: driverConfig[currDriver].removeVendor ?
          match[2].substring(match[1].length + 1) : match[2],
      };
    })
    .filter((value): value is DeviceRecord => Boolean(value));
}

async function findDev(vendor_dev: string, device_dev: string, deviceDevsText: string, driverId: bigint): Promise<void> {
  const regex = new RegExp(`^product\\s+${vendor_dev}\\s+${device_dev}\\s+(\\S+)[^\\S\\r\\n]+(.+)`, 'm');
  const match = deviceDevsText.match(regex);
  if (match) {
    console.log(`${driverConfig[currDriver].bus} device found: ${match[1]} ${match[2]}`);
    const deviceDevId = match[1];
    const deviceName = match[2];
// /*
    const vendor = await prisma.vendors.findFirst({
      where: { [driverConfig[currDriver].bus === "USB" ? "usbdev" : "pcidev"]: vendor_dev },
    });
    if (vendor) {
      console.log(`${driverConfig[currDriver].bus} vendor found: ${vendor.id} ${vendor.name}`);
    } else {
      throw new Error(`${driverConfig[currDriver].bus} vendor not found for ${vendor_dev}`);
    }

    const existing = await prisma.devices.findFirst({
      where: {
        dev_id: deviceDevId,
        vendor_id: vendor.id,
        driver_id: driverId,
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
          bus: driverConfig[currDriver].bus ?? null,
          support_status: "supported",
        },
      });
      console.log(`Device created: ${deviceDevId} ${deviceName}\n`);
    } else {
      console.log(`Device already exists: ${existing.dev_id} ${existing.name}!!!\n`);
    }
// */
  } else {
    throw new Error(`${driverConfig[currDriver].bus} device not found: ${vendor_dev} ${device_dev}`);
  }
}

async function importDevices(filePath: string, driverId: bigint): Promise<void> {
  let text;
  try {
    text = await readFile(filePath, "utf8");
  } catch (e) {
    console.log((e as Error).message);
    process.exit(-1);
  }
  const extracted = extractDeviceFields(text);

  const deviceDevsText = await readFile(deviceDevsPath, "utf8");

  for (const device of extracted) {
//  for (let i = 0; i < Math.min(extracted.length, 10); i++) {
//    const device = extracted[i];
//    console.log(`Device: ${device.vendor_dev} ${device.device_dev}`);
    try {
      await findDev(device.vendor_dev, device.device_dev, deviceDevsText, driverId);
    } catch (error) {
      console.error(`Failed to add ${driverConfig[currDriver].bus} device: ${device.vendor_dev} ${device.device_dev}`, error);
    }
  }
}


async function importDriver(): Promise<void> {
  let driverId: bigint | undefined;

  // Implementation for importing the driver goes here
  const existingDriver = await prisma.drivers.findFirst({
    where: { name: driverConfig[currDriver].name },
  });
  if (!existingDriver) {
    const driver = await prisma.drivers.create({
      data: {
        name: driverConfig[currDriver].name,
        dev_type: driverConfig[currDriver].devType,
      },
    });
    console.log(`Driver created: ${driver.id} ${driver.name}`);
    driverId = driver.id;
  } else {
    console.log(`Driver already exists: ${existingDriver.id} ${existingDriver.name}`);
    driverId = existingDriver.id;
  }

  importDevices(driverConfig[currDriver].path, driverId)
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
