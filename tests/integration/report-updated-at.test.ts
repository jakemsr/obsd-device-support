import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
} from "@jest/globals";
import testPrisma from "@/lib/test-prisma";


async function cleanupTestData() {
  await testPrisma.reported_devices.deleteMany({
    where: {
      report: {
        user_id: "integration-test-user",
      },
    },
  });

  await testPrisma.reports.deleteMany({
    where: {
      user_id: "integration-test-user",
    },
  });

  await testPrisma.user.deleteMany({
    where: {
      id: "integration-test-user",
    },
  });
}

beforeEach(async () => {
  await cleanupTestData();
});

afterEach(async () => {
  await cleanupTestData();
});

afterAll(async () => {
  await testPrisma.$disconnect();
});


describe("report updated_at trigger", () => {
  test("updates reports.updated_at when a reported device is updated", async () => {
    const user = await testPrisma.user.create({
      data: {
        id: "integration-test-user",
        name: "Integration Test",
        email: "integration-test@example.com",
      },
    });

    const report = await testPrisma.reports.create({
      data: {
        user_id: user.id,
      },
    });

    const reportedDevice = await testPrisma.reported_devices.create({
      data: {
        report_id: report.id,
        bus: "USB",
        vendor_id: "0x0bda",
        product_id: "0xf179",
      },
    });

    const oldTimestamp = new Date("2000-01-01T00:00:00Z");

    await testPrisma.reports.update({
      where: {
        id: report.id,
      },
      data: {
        updated_at: oldTimestamp,
      },
    });

    await testPrisma.reported_devices.update({
      where: {
        id: reportedDevice.id,
      },
      data: {
        reported_product: "RTL8188FTV",
      },
    });

    const updatedReport = await testPrisma.reports.findUniqueOrThrow({
      where: {
        id: report.id,
      },
    });

    expect(updatedReport.updated_at.getTime()).toBeGreaterThan(
      oldTimestamp.getTime()
    );
  });
});
