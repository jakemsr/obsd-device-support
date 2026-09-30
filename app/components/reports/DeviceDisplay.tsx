import type { FullReportedDevice, FullDeviceInfo } from "@/lib/local-types";


interface DeviceDisplayProps {
  device: FullReportedDevice;
  matchedDevices?: FullDeviceInfo[];
}

const DeviceDisplay = ({ device, matchedDevices }: DeviceDisplayProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6">
      <div className="grid grid-cols-3">
        <div className="font-bold">
          Bus:
        </div>
        <div className="col-span-2">
          {device.bus}
        </div>
        <div className="font-bold">
          Vendor ID:
        </div>
        <div className="col-span-2">
          {device.vendor_id}
        </div>
        <div className="font-bold">
          Product ID:
        </div>
        <div className="col-span-2">
          {device.product_id}
        </div>
        <div className="font-bold">
          Reported Vendor:
        </div>
        <div className="col-span-2">
          {device.reported_vendor}
        </div>
        <div className="font-bold">
          Reported Product:
        </div>
        <div className="col-span-2">
          {device.reported_product}
        </div>
        <div className="font-bold">
          Reported Driver:
        </div>
        <div className="col-span-2">
          {device.reported_driver}
        </div>
        <div className="font-bold">
          Support Status:
        </div>
        <div className="col-span-2">
          {device.support_status}
        </div>

        {device.reported_issues.length > 0 && (
          <div className="mt-2 col-span-3">
            <div className="font-bold">
              Reported Issues:
            </div>
            {device.reported_issues.map(issue => (
              <div
                className="px-4 col-span-3"
                key={issue.id}
              >
                {issue.description}
              </div>
            ))}
          </div>
        )}

        {device.reported_other_device_names.length > 0 && (
          <div className="mt-2 col-span-3">
            <div className="font-bold">
              Reported Other Device Names:
            </div>
            {device.reported_other_device_names.map(name => (
              <div
                className="px-4 col-span-3"
                key={name.id}
              >
                {name.vendor_name} {name.product_name}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="font-bold">
          VID/PID Matches Existing Devices:
        </div>
        {matchedDevices && matchedDevices.length > 0 ? (
          <div>
            {matchedDevices.map(matchedDevice => (
              <div key={matchedDevice.id} className="grid grid-cols-3 px-4 mt-1">
                <div className="font-bold">
                  Vendor:
                </div>
                <div className="col-span-2">
                  {matchedDevice.vendors.name}
                </div>
                <div className="font-bold">
                  Product:
                </div>
                <div className="col-span-2">
                  {matchedDevice.name}
                </div>
                <div className="font-bold">
                  Driver:
                </div>
                <div className="col-span-2">
                  {matchedDevice.drivers.name}
                </div>

                <div className="col-span-3 font-bold">
                  Issues:
                </div>
                {matchedDevice.issues.length > 0 ? (
                  <div className="col-span-3">
                    {matchedDevice.issues.map(issue => (
                      <div className="px-4 mb-2" key={issue.id}>
                        {issue.description}
                      </div>
                    ))}
                  </div>
                ) : (
                <div className="px-4 mb-2 col-span-3">
                  No known issues
                </div>
                )}

                <div className="col-span-3 font-bold">
                  Other Device Names:
                </div>
                {matchedDevice.other_device_names.length > 0 ? (
                  <div className="col-span-3">
                    {matchedDevice.other_device_names.map(name => (
                      <div className="px-4 mb-2" key={name.id}>
                        {name.vendor_name} {name.device_name}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 mb-2 col-span-3">
                    No other device names
                  </div>
                )}

              </div>
            ))}
          </div>
        ) : (
          <div className="px-4 mt-1">
            No matching devices
          </div>
        )}
      </div>
    </div>
  );
}

export default DeviceDisplay;
