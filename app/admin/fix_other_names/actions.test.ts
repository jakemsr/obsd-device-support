import { beforeAll, beforeEach, describe, expect, jest, test } from "@jest/globals";

const mockGetCurrentUser = jest.fn<() => Promise<{ role: string } | null>>();
const mockUpdate = jest.fn<(args: unknown) => Promise<{ vendor_name: string; device_name: string }>>();
const mockDelete = jest.fn<(args: unknown) => Promise<object>>();

jest.mock("@/lib/check-user-auth", () => ({ getCurrentUser: mockGetCurrentUser }));
jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: { other_device_names: { update: mockUpdate, delete: mockDelete } },
}));

let updateOtherName: typeof import("./actions").updateOtherName;

beforeAll(async () => {
  ({ updateOtherName } = await import("./actions"));
});

beforeEach(() => {
  jest.clearAllMocks();
  mockGetCurrentUser.mockResolvedValue({ role: "admin" });
  mockUpdate.mockResolvedValue({ vendor_name: "Vendor", device_name: "Device" });
  mockDelete.mockResolvedValue({});
});

function validFormData() {
  const formData = new FormData();
  formData.set("vendor_name", "Vendor");
  formData.set("device_name", "Device");
  formData.set("device_id", "123");
  return formData;
}

describe("updateOtherName validation", () => {
  test.each([
    ["vendor_name", " ", "Vendor Name: Required"],
    ["device_name", "", "Device Name: Required"],
    ["device_id", "", "Id: Required"],
    ["device_id", "not-a-number", "Id: Expected a numeric ID"],
  ])("rejects invalid input without modifying the database", async (field, value, error) => {
    const formData = validFormData();
    formData.set(field, value);
    expect(await updateOtherName(formData)).toEqual({ ok: false, error });
    expect(mockUpdate).not.toHaveBeenCalled();
    expect(mockDelete).not.toHaveBeenCalled();
  });

  test("rejects invalid checkbox values", async () => {
    const formData = validFormData();
    formData.set("delete_entry", "false");
    const result = await updateOtherName(formData);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("Delete Entry:");
    expect(mockUpdate).not.toHaveBeenCalled();
    expect(mockDelete).not.toHaveBeenCalled();
  });

  test("updates or deletes using valid input", async () => {
    const formData = validFormData();
    expect((await updateOtherName(formData)).ok).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: BigInt(123) },
      data: { vendor_name: "Vendor", device_name: "Device" },
    });

    formData.set("delete_entry", "on");
    expect((await updateOtherName(formData)).ok).toBe(true);
    expect(mockDelete).toHaveBeenCalledWith({ where: { id: BigInt(123) } });
  });

  test("denies non-admin users before validating", async () => {
    mockGetCurrentUser.mockResolvedValue(null);
    expect(await updateOtherName(new FormData())).toEqual({ ok: false, error: "Access denied" });
    expect(mockUpdate).not.toHaveBeenCalled();
    expect(mockDelete).not.toHaveBeenCalled();
  });

});
