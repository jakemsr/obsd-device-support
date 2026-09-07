import { Prisma } from "@/app/generated/prisma/client";
import { FullDeviceInfo } from "@/lib/local-types";
import prisma from "@/lib/prisma";


const matchMap = new Map<BigInt, FullDeviceInfo[]>();

type SourceWithReports = Prisma.report_sourcesGetPayload<{
  include: {
    hwinspect_report: true;
    form_report: true;
  };
}>;

const sourceDisplay = (source: SourceWithReports) => {
  return (
    <div>
      <div>
        Name: {source.name}
      </div>
      <div>
        Type: {source.source_type}
      </div>
      <div>
        URL: {source.url}
      </div>
      {source.hwinspect_report && (
        <div>
          hwinspect Report:
          <div>
            ID: {source.hwinspect_report.id}
          </div>
          <div>
            hwinspect Version: {source.hwinspect_report.hwinspect_version}
          </div>
          <div>
            OpenBSD Version: {source.hwinspect_report.openbsd_version}
          </div>
          <div>
            Architecture: {source.hwinspect_report.architecture}
          </div>
          <div>
            Collected At: {source.hwinspect_report.collected_at?.toLocaleString()}
          </div>
          <div>
            Payload: {JSON.stringify(source.hwinspect_report.payload, null, 2)}
          </div>
          <div>
            Payload Version: {source.hwinspect_report.payload_version}
          </div>
        </div>
      )}
      {source.form_report && (
        <div>
          Form Report:
          <div>
            ID: {source.form_report.id}
          </div>
          <div>
            Report Source ID: {source.form_report.report_source_id}
          </div>
          <div>
            URL: {source.form_report.url}
          </div>
          <div>
            Collected At: {source.form_report.collected_at?.toLocaleString()}
          </div>
          <div>
            Payload: {JSON.stringify(source.form_report.payload, null, 2)}
          </div>
          <div>
            Payload Version: {source.form_report.payload_version}
          </div>
        </div>
      )}
    </div>
  );
}

type FullReportedDevice = Prisma.reported_devicesGetPayload<{
  include: {
    reported_issues: true;
    reported_other_device_names: true;
  };
}>;


const deviceDisplay = (device: FullReportedDevice) => {
  return (
    <div className="my-2 grid grid-cols-2">
      <div>
        <div>
          Bus: {device.bus}
        </div>
        <div>
          Vendor ID: {device.vendor_id}
        </div>
        <div>
          Product ID: {device.product_id}
        </div>
        <div>
          Reported Vendor: {device.reported_vendor}
        </div>
        <div>
          Reported Product: {device.reported_product}
        </div>
        <div>
          Reported Driver: {device.reported_driver}
        </div>
        <div>
          Support Status: {device.support_status}
        </div>

        {device.reported_issues.length > 0 && (
          <div>
            Reported Issues: {device.reported_issues.map(issue => (
              <div
                className="px-4 mt-2"
                key={issue.id}
              >
                {issue.description}
              </div>
            ))}
          </div>
        )}

        {device.reported_other_device_names.length > 0 && (
          <div className="mt-2">
            Reported Other Device Names: {device.reported_other_device_names.map(name => (
              <div
                className="px-4"
                key={name.id}
              >
                {name.vendor_name} {name.product_name}
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        Matched Devices:
        {matchMap.get(device.id)?.map(matchedDevice => (
          <div key={matchedDevice.id} className="px-4 mt-2">
            <div>
              Vendor:{matchedDevice.vendors.name}
            </div>
            <div>
              Product: {matchedDevice.name}
            </div>
            <div>
              Driver: {matchedDevice.drivers.name}
            </div>
            <div>
              Issues: {matchedDevice.issues.map(issue => (
                <div key={issue.id}>
                  {issue.description}
                </div>
              ))}
            </div>
            <div>
              Other Device Names: {matchedDevice.other_device_names.map(name => (
                <div key={name.id}>
                  {name.vendor_name} {name.device_name}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {

  const { id } = await params;

  const report = await prisma.reports.findUnique({
    where: {
      id: BigInt(id),
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

  if (!report) {
    return (
      <div>
        Report not found
      </div>
    );
  }

  report.reported_devices.forEach(async device => {

    const devices: FullDeviceInfo[] = await prisma.devices.findMany({
      where: {
        product_id: "0x" + device.product_id,
        bus: device.bus,
        vendors: {
          [device.bus === "PCI" ? "pci_id" : "usb_id"]: "0x" + device.vendor_id,
        },
      },
      include: {
        vendors: true,
        drivers: true,
        issues: true,
        other_device_names: true,
      },
      orderBy: { name: "asc" },
    });

    matchMap.set(device.id, devices);
  });


  return (
    <div className="px-4">
      <div>
        Report ID {report.id}
      </div>
      <div className="px-4 mt-4">
        <div>
          Status: {report.status}
        </div>
        <div>
          Created At: {report.created_at.toLocaleString()}
        </div>
        <div>
          Updated At: {report.updated_at.toLocaleString()}
        </div>

        {report.sources.length > 0 && (
          <div className="mt-4">
            Sources:
            {report.sources.map(source => (
              <div
                className="px-4 border-t"
                key={source.id}
              >
                {sourceDisplay(source)}
              </div>
            ))}
          </div>
        )}

        {report.reported_devices.length > 0 && (
          <div className="mt-4">
            Reported Devices:
            {report.reported_devices.map(device => (
              <div
                className="px-4 border-t"
                key={device.id}>
                {deviceDisplay(device)}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
      </div>
    </div>
  );
}