import { beforeEach, describe, test, expect, jest } from '@jest/globals';

const mockFindMany: jest.Mock<(args: unknown) => Promise<unknown[]>> = jest.fn();

beforeEach(() => {
  mockFindMany.mockReset();
});

jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    devices: {
      findMany: mockFindMany,
    },
  },
}));

import { GET } from "./route";

describe("GET /api/devices/by_bus_vid_pid", () => {
  test("returns 400 when required parameters are missing", async () => {
    const request = new Request(
      "http://localhost/api/devices/by_bus_vid_pid?bus=USB&vendor_id=0bda"
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      error: "bus, vendor_id, and product_id are required",
    });
  });

  test("returns 400 for an invalid device ID", async () => {
    const request = new Request(
      "http://localhost/api/devices/by_bus_vid_pid?bus=USB&vendor_id=bda&product_id=f179"
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      error: "Invalid vendor_id or product_id",
    });
  });

  test("returns a matching USB device", async () => {
    mockFindMany.mockResolvedValue([
      {
        name: "RTL8188FTV",
        support_status: "supported",
        vendors: {
          name: "Realtek",
        },
        drivers: {
          name: "urtwn",
        },
        other_device_names: [],
      },
    ]);

    const request = new Request(
      "http://localhost/api/devices/by_bus_vid_pid" +
      "?bus=USB&vendor_id=0BDA&product_id=F179"
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);

    expect(data).toEqual({
      bus: "USB",
      vendor_id: "0x0bda",
      product_id: "0xf179",
      matches: [
        {
          vendor: "Realtek",
          device: "RTL8188FTV",
          driver: "urtwn",
          support_status: "supported",
          other_names: [],
        },
      ],
    });

    expect(mockFindMany).toHaveBeenCalledWith({
      where: {
        product_id: "0xf179",
        bus: "USB",
        vendors: {
          usb_id: "0x0bda",
        },
      },
      include: {
        vendors: true,
        drivers: true,
        other_device_names: true,
      },
      orderBy: {
        name: "asc",
      },
    });

  });

  test("queries pci_id for a PCI device", async () => {
    mockFindMany.mockResolvedValue([
      {
        name: "some PCI device",
        support_status: "supported",
        vendors: {
          name: "some vendor",
        },
        drivers: {
          name: "some_driver",
        },
        other_device_names: [],
      },
    ]);

    const request = new Request(
      "http://localhost/api/devices/by_bus_vid_pid" +
      "?bus=pci&vendor_id=8086&product_id=1234"
    );

    const response = await GET(request);

    expect(response.status).toBe(200);

    expect(mockFindMany).toHaveBeenCalledWith({
      where: {
        product_id: "0x1234",
        bus: "PCI",
        vendors: {
          pci_id: "0x8086",
        },
      },
      include: {
        vendors: true,
        drivers: true,
        other_device_names: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  });


  test("queries an unsupported bus", async () => {

    const request = new Request(
      "http://localhost/api/devices/by_bus_vid_pid" +
      "?bus=isa&vendor_id=8086&product_id=1234"
    );

    const response = await GET(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toEqual({ error: "bus must be either PCI or USB" });

    expect(mockFindMany).not.toHaveBeenCalled();
  });


  test("returns an empty array when no matches are found", async () => {
    mockFindMany.mockResolvedValue([]);

    const request = new Request(
      "http://localhost/api/devices/by_bus_vid_pid" +
      "?bus=USB&vendor_id=0BDA&product_id=F179"
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);

    expect(data).toEqual({
      bus: "USB",
      vendor_id: "0x0bda",
      product_id: "0xf179",
      matches: [],
    });

  });


  test("returns a matching USB device with other device names", async () => {
    mockFindMany.mockResolvedValue([
      {
        name: "RTL8188FTV",
        support_status: "supported",
        vendors: {
          name: "Realtek",
        },
        drivers: {
          name: "urtwn",
        },
        other_device_names: [
          {
            device_name: "WiFi USB",
            vendor_name: "ACME"
          }
        ],
      },
    ]);

    const request = new Request(
      "http://localhost/api/devices/by_bus_vid_pid" +
      "?bus=USB&vendor_id=0BDA&product_id=F179"
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);

    expect(data).toEqual({
      bus: "USB",
      vendor_id: "0x0bda",
      product_id: "0xf179",
      matches: [
        {
          vendor: "Realtek",
          device: "RTL8188FTV",
          driver: "urtwn",
          support_status: "supported",
          other_names: [
            {
              vendor: "ACME",
              device: "WiFi USB"
            }
          ],
        },
      ],
    });

  });


});
