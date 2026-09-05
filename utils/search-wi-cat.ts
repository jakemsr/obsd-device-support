import "dotenv/config";
import prisma from "@/lib/prisma";
import { createAuthClient } from "better-auth/client";
import { support_type } from "@/app/generated/prisma/enums";

const args = process.argv.slice(2);

// last driver added before last run: 91 an, but ONLY USB

// get vendor and device ids from public.devices table
// where bus is USB
async function getVendorAndDeviceIds(): Promise<{ device_id: bigint; vendor_usb_id: string | null; vendor_name: string | null; device_usb_id: string | null; device_name: string | null; support_status: string | null }[]> {
  const devices = await prisma.devices.findMany({
    select: {
      id: true,
      name: true,
      product_id: true,
      support_status: true,
      vendors: {
        select: {
          name: true,
          usb_id: true,
        },
      },
    },
    where: {
      bus: "USB",
      driver_id: { gt: BigInt(13) },
    },
  });
  return devices.map(device => ({
    device_id: device.id,
    vendor_usb_id: device.vendors.usb_id?.substring(2) || null, // remove the "0x" prefix if present
    vendor_name: device.vendors.name || null,
    device_usb_id: device.product_id?.substring(2) || null, // remove the "0x" prefix if present
    device_name: device.name || null,
    support_status: device.support_status || null,
  }));
}

async function fetchData(vendorID: string, deviceID: string): Promise<any> {

  const fetchURLBase = "https://wikidevi.wi-cat.ru/index.php"

  const fetchURLParams = [
    { name: 'title', value: 'Special:Ask' },
    {
      name: 'x',
      value: `-5B-5BVendor-20ID::${vendorID}-5D-5D-20-5B-5BDevice-20ID::${deviceID}-5D-5D/-3FInterface/-3FForm-20factor=FF/-3FInterface-20connector-20type=USB-20conn./-3FVendor-20ID/-3FDevice-20ID/-3FChip1-20model`
    },
    { name: 'format', value: 'json' },
    { name: 'limit', value: '500' },
    { name: 'link', value: 'all' },
    { name: 'headers', value: 'show' },
    { name: 'searchlabel', value: 'JSON' },
    { name: 'class', value: 'sortable wikitable smwtable' },
    { name: 'sort', value: '' },
    { name: 'order', value: '' },
    { name: 'offset', value: '0' },
    { name: 'mainlabel', value: '' },
    { name: 'prettyprint', value: 'true' },
    { name: 'unescape', value: 'true' }
  ];

  const fetchURL = `${fetchURLBase}?${fetchURLParams.map(param => `${encodeURIComponent(param.name)}=${encodeURIComponent(param.value)}`).join('&')}`;

  const response = await fetch(fetchURL);
  if (!response.ok) {
    return Promise.reject(new Error(`Response error: ${response.status} ${response.statusText}`));
  }
  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    return Promise.reject(new Error(`Expected JSON, got: ${contentType}`));
  }
  try {
    const data = await response.json();
    return data;
  } catch (error) {
    return null;
    //return Promise.reject(new Error(`Failed to parse JSON: ${error}`));
  }
}

async function main() {

  const [email, password] = args;

  const authClient = createAuthClient({
    baseURL: "http://localhost:3000", // Your API URL
    fetchOptions: {
        headers: {
            "Origin": "http://localhost:3000"
        }
    }
  });

  const {data, error} =  await authClient.signIn.email({
        email: email,
        password: password
  });

  if (error) {
    console.error("Failed to sign in:", error);
    return;
  }

  const user = data.user;

  if (!user) {
    console.error("No active user found.");
    return;
  }

  // create report
  const report = await prisma.reports.create({
    data: {
      user_id: user.id,
    },
  });

  // create report_source
  const reportSource = await prisma.report_sources.create({
    data: {
      report_id: report.id,
      name: "wikidevi.wi-cat.ru",
      source_type: "website",
      url: "https://wikidevi.wi-cat.ru/index.php",
    },
  });

  const vendorAndDeviceIds = await getVendorAndDeviceIds();
  for (const { device_id, vendor_usb_id, vendor_name, device_usb_id, device_name, support_status } of vendorAndDeviceIds) {
    if (vendor_usb_id && device_usb_id) {
      console.log(`Fetching data for ${vendor_name} ${device_name}, ${vendor_usb_id}:${device_usb_id}`);
      try {
        const data = await fetchData(vendor_usb_id, device_usb_id);
        if (!data || !data.results) {
          console.log(`No results found for ${vendor_usb_id}:${device_usb_id}`);
          continue;
        }
        const fulltexts = Object.values(data.results).map((entry: any) => ({
          fulltext: entry.fulltext,
          interface: entry.printouts.Interface[0],
          USBconn: entry.printouts["USB conn."][0],
          vendorID: entry.printouts["Vendor ID"][0],
          deviceID: entry.printouts["Device ID"][0],
        }));
        const filtered = fulltexts.filter((entry: any) =>
          entry.interface === "USB" &&
          entry.USBconn === "Male A" &&
          entry.vendorID === vendor_usb_id &&
          entry.deviceID === device_usb_id
        );
        if (filtered.length > 0) {

          // create reported_device
          const reportedDevice = await prisma.reported_devices.create({
            data: {
              report_id: report.id,
              bus: "USB",
              vendor_id: vendor_usb_id,
              product_id: device_usb_id,
              support_status: support_status as support_type
            },
          });

          console.log(`Found ${filtered.length} matching entries:`);
          filtered.forEach(async (entry: any, index: number) => {
            console.log(`Adding ${entry.fulltext}`);

            await prisma.reported_other_device_names.create({
              data: {
                vendor_name: "",
                product_name: entry.fulltext,
                reported_device_id: reportedDevice.id,
              },
            });
          });
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    }
  }
}

main();
