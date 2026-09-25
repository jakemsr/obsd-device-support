import { getMatchedDevices } from "@/app/reports/[id]/actions";
import DeviceDisplay from "@/app/components/reports/DeviceDisplay";
import type { FullReport } from "@/lib/local-types";


interface ShowDevicesProps {
  report: FullReport;
} 

const ShowDevices = async ({ report }: ShowDevicesProps) => {

  const matchMap = await getMatchedDevices(report);

  return (
    <>
      {
        report.reported_devices.length > 0 && (
          <div className="mt-4">
            Reported Devices:
            {report.reported_devices.map(device => (
              <div
                className="px-4 border-t"
                key={device.id}
              >
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
