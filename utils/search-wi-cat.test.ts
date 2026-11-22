import { afterEach, beforeEach, describe, expect, jest, test } from "@jest/globals";

const mockFindMany = jest.fn<() => Promise<object[]>>();
const mockCreateReport = jest.fn<(args: unknown) => Promise<{ id: bigint }>>();
const mockCreateSource = jest.fn<(args: unknown) => Promise<{ id: bigint }>>();
const mockCreateDevice = jest.fn<(args: unknown) => Promise<{ id: bigint }>>();
const mockCreateName = jest.fn<(args: unknown) => Promise<{ id: bigint }>>();

jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    devices: { findMany: mockFindMany },
    reports: { create: mockCreateReport },
    report_sources: { create: mockCreateSource },
    reported_devices: { create: mockCreateDevice },
    reported_other_device_names: { create: mockCreateName },
  },
}));
jest.mock("better-auth/client", () => ({
  createAuthClient: () => ({
    signIn: { email: async () => ({ data: { user: { id: "user" } }, error: null }) },
  }),
}));

const validEntry = {
  fulltext: "Example device",
  printouts: {
    Interface: ["USB"],
    "USB conn.": ["Male A"],
    "Vendor ID": ["0bda"],
    "Device ID": ["f179"],
  },
};

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
  jest.spyOn(console, "log").mockImplementation(() => {});
  mockFindMany.mockResolvedValue([{
    id: BigInt(1),
    name: "Example",
    product_id: "0xf179",
    support_status: "supported",
    vendors: { name: "Example", usb_id: "0x0bda" },
  }]);
  mockCreateReport.mockResolvedValue({ id: BigInt(1) });
  mockCreateSource.mockResolvedValue({ id: BigInt(1) });
  mockCreateDevice.mockResolvedValue({ id: BigInt(1) });
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("Wi-Cat response validation", () => {
  test("imports matching entries and skips values that do not match", async () => {
    jest.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      results: {
        matching: validEntry,
        other: { ...validEntry, printouts: { ...validEntry.printouts, Interface: [{ label: "USB" }] } },
      },
    }), { headers: { "content-type": "application/json" } }));
    let finish!: () => void;
    const finished = new Promise<void>(resolve => { finish = resolve; });
    mockCreateName.mockImplementation(async () => {
      finish();
      return { id: BigInt(1) };
    });

    await import("./search-wi-cat");
    await finished;

    expect(mockCreateName).toHaveBeenCalledTimes(1);
    expect(mockCreateName).toHaveBeenCalledWith({
      data: { vendor_name: "", product_name: "Example device", reported_device_id: BigInt(1) },
    });
  });

  test("reports malformed entries without creating records", async () => {
    jest.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      results: { invalid: { ...validEntry, printouts: { ...validEntry.printouts, "Vendor ID": "0bda" } } },
    }), { headers: { "content-type": "application/json" } }));
    let finish!: () => void;
    const finished = new Promise<void>(resolve => { finish = resolve; });
    const error = jest.spyOn(console, "error").mockImplementation(() => { finish(); });

    await import("./search-wi-cat");
    await finished;

    expect(error).toHaveBeenCalledWith("Failed to fetch data:", expect.any(Error));
    expect(mockCreateReport).not.toHaveBeenCalled();
  });
});
