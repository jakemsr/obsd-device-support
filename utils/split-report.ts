import 'dotenv/config';
import prisma from "@/lib/prisma";

async function main() {

  const report = await prisma.reports.findUnique({
    where: {
      id: BigInt(1), // Replace with the actual report ID you want to fetch
    },
    include: {
      sources: {
        include: {
          hwinspect_report: true,
          form_report: true,
        },
      },
      reported_devices: {
        include: {
          reported_issues: true,
          reported_other_device_names: true,
        }
      }
    }
  });

  report?.reported_devices.forEach(async device => {

    // Create a new report for each reported device
    const newReport = await prisma.reports.create({
      data: {
        user_id: report.user_id,
        status: report.status,
      }
    });

    const newSources = await prisma.report_sources.createMany({
      data: report.sources.map(source => ({
        report_id: newReport.id,
        name: source.name,
        source_type: source.source_type,
        url: source.url,
      })),
    });

    const newReportedDevice = await prisma.reported_devices.create({
      data: {
        report_id: newReport.id,
        bus: device.bus,
        vendor_id: device.vendor_id,
        product_id: device.product_id,
        reported_vendor: device.reported_vendor,
        reported_product: device.reported_product,
        reported_driver: device.reported_driver,
        support_status: device.support_status,
      }
    });

    const newReportedIssues = await prisma.reported_issues.createMany({
      data: device.reported_issues.map(issue => ({
        reported_device_id: newReportedDevice.id,
        description: issue.description,
      })),
    });

    const newReportedOtherDeviceNames = await prisma.reported_other_device_names.createMany({
      data: device.reported_other_device_names.map(name => ({
        reported_device_id: newReportedDevice.id,
        vendor_name: name.vendor_name,
        product_name: name.product_name,
      })),
    });
  });
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
