import { getMatchedDevices } from "@/app/reports/[id]/actions";
import DeviceDisplay from "@/app/components/reports/DeviceDisplay";
import type { FullReport } from "@/lib/local-types";


interface ShowDevicesProps {
  report: FullReport;
} 

const ShowDevices = async ({ report }: ShowDevicesProps) => {

  const matchMap = await getMatchedDevices(report.reported_devices);

  return (
    <>
      {
        report.reported_devices.length > 0 && (
          <div className="mt-4">
            <div className="font-bold">
              Reported Devices:
            </div>
            {report.reported_devices.map((device, index) => (
              <div
                className="px-4 mt-1"
                key={index}
              >
                <div className="font-bold">
                  Device #{index + 1}
                </div>
                <DeviceDisplay device={device} matchedDevices={matchMap.get(device.id)} />
              </div>
            ))}
          </div>
        )
      }
    </>
  );
}

export default ShowDevices;
