import { beforeAll, beforeEach, describe, expect, jest, test } from "@jest/globals";

const mockGetCurrentUser = jest.fn<() => Promise<{ role: string } | null>>();
const mockUpdate = jest.fn<(args: unknown) => Promise<object>>();
const mockRefresh = jest.fn();

jest.mock("@/lib/check-user-auth", () => ({ getCurrentUser: mockGetCurrentUser }));
jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: { user: { update: mockUpdate } },
}));
jest.mock("next/cache", () => ({ refresh: mockRefresh }));

let updateRole: typeof import("./actions").updateRole;

beforeAll(async () => {
  ({ updateRole } = await import("./actions"));
});

beforeEach(() => {
  jest.clearAllMocks();
  mockGetCurrentUser.mockResolvedValue({ role: "admin" });
  mockUpdate.mockResolvedValue({});
});

function validFormData() {
  const formData = new FormData();
  formData.set("userId", "user-123");
  formData.set("role", "user");
  return formData;
}

describe("updateRole validation", () => {
  test.each(["user", "editor", "admin"])("accepts the %s role", async (role) => {
    const formData = validFormData();
    formData.set("role", role);

    expect(await updateRole(formData)).toEqual({ ok: true, data: "Role updated successfully" });
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "user-123" },
      data: { role },
    });
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  test.each([
    ["missing user ID", "userId", null],
    ["blank user ID", "userId", "  "],
    ["missing role", "role", null],
    ["invalid role", "role", "superuser"],
  ])("rejects %s without updating", async (_description, field, value) => {
    const formData = validFormData();
    if (value === null) formData.delete(field);
    else formData.set(field, value);

    expect((await updateRole(formData)).ok).toBe(false);
    expect(mockUpdate).not.toHaveBeenCalled();
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  test.each(["userId", "role"])("rejects a file in %s", async (field) => {
    const formData = validFormData();
    formData.set(field, new Blob(["user"]), "input.txt");

    expect((await updateRole(formData)).ok).toBe(false);
    expect(mockUpdate).not.toHaveBeenCalled();
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  test("denies non-admin users before validating", async () => {
    mockGetCurrentUser.mockResolvedValue({ role: "user" });
    expect(await updateRole(new FormData())).toEqual({ ok: false, error: "Access denied" });
    expect(mockUpdate).not.toHaveBeenCalled();
    expect(mockRefresh).not.toHaveBeenCalled();
  });
});
