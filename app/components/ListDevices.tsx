"use client";
import { useState } from "react";
import DeviceListEntry from "./DeviceListEntry";
import type { DeviceListEntryProps, FullDeviceInfo } from "@/lib/local-types";


enum FilterType {
  Bus = "bus",
  DevType = "type"
}

interface ListDevicesProps {
  devices: FullDeviceInfo[];
  search?: string;
}

export default function ListDevices({ devices, search }: ListDevicesProps) {

  const handleCheckboxChange = (id: number, mode: FilterType) => {
    let setter: React.Dispatch<React.SetStateAction<number[]>> = () => [];
    switch (mode) {
      case FilterType.Bus:
        setter = setBusFilterIds;
        break;
      case FilterType.DevType:
        setter = setDevTypeFilterIds;
        break;
      default:
        console.error("handleCheckBoxChange bad mode");
    }
    setter((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id) // Uncheck: Remove ID
        : [...prev, id]                     // Check: Add ID
    );
  }

  const deviceListEntries: DeviceListEntryProps[] = devices.flatMap((device) => {
    const searchTerms = search?.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean) ?? [];
    const vendorName = device.vendors.name ?? "";
    const canonicalName = `${vendorName} ${device.name}`;
    const canonicalFields = [vendorName, device.name].map((field) => field.toLocaleLowerCase());
    const canonicalMatches = searchTerms.every((term) =>
      canonicalFields.some((field) => field.includes(term))
    );

    if (canonicalMatches || searchTerms.length === 0) {
      return [{
        name: canonicalName,
        bus: device.bus,
        devType: device.drivers.dev_type,
        vid: device.bus === "USB" ? device.vendors.usb_id || "" : device.vendors.pci_id || "",
        pid: device.dev_id,
      }];
    }

    const matchingOtherNames = device.other_device_names.filter((otherName) =>
      searchTerms.every((term) => otherName.device_name.toLocaleLowerCase().includes(term))
    );

    return matchingOtherNames.length > 0
      ? matchingOtherNames.map((otherName) => ({
        name: otherName.device_name,
        bus: device.bus,
        devType: device.drivers.dev_type,
        vid: device.bus === "USB" ? device.vendors.usb_id || "" : device.vendors.pci_id || "",
        pid: device.dev_id,
      }))
      : [{
        name: canonicalName,
        bus: device.bus,
        devType: device.drivers.dev_type,
        vid: device.bus === "USB" ? device.vendors.usb_id || "" : device.vendors.pci_id || "",
        pid: device.dev_id,
      }];
  });
  const sortedDeviceListEntries = deviceListEntries.toSorted((a, b) => a.name.localeCompare(b.name));

  const devTypeFilters = [...new Set(devices.map((device) => device.drivers.dev_type))]
    .map((filter, index) => ({ id: index, name: filter }));

  const busFilters = [...new Set(devices.map((device) => device.bus))]
    .map((filter, index) => ({ id: index, name: filter }));

  const [devTypeFilterIds, setDevTypeFilterIds] = useState<number[]>(devTypeFilters.map(filter => filter.id));
  const [busFilterIds, setBusFilterIds] = useState<number[]>(busFilters.map(filter => filter.id));

  const selectedDevTypes = new Set(
    devTypeFilterIds
      .map((id) => devTypeFilters[id]?.name)
      .filter((name): name is string => name !== undefined)
  );

  const selectedBuses = new Set(
    busFilterIds
      .map((id) => busFilters[id]?.name)
      .filter((name): name is string => name !== undefined)
  );

  const filteredDeviceListEntries = sortedDeviceListEntries.filter(
    (device) =>
      selectedDevTypes.has(device.devType) &&
      selectedBuses.has(device.bus)
  );


  return (
    <>
      <div>
        <div className="flex items-center justify-center font-bold mt-4">
          {filteredDeviceListEntries.length === 0 ? (
            <div>No devices matched.</div>
          ) : (
            <div>
              Matched {filteredDeviceListEntries.length} device{filteredDeviceListEntries.length !== 1 ? "s" : ""}.
            </div>
          )}
        </div>
      </div>

      <div className="flex px-4 mt-4">
        <div className="flex flex-col w-40">
          Filters:
          <div>
            Type:
            {devTypeFilters
              .map((devType) => (
                <div key={devType.id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={devTypeFilterIds.includes(devType.id)}
                      onChange={() => handleCheckboxChange(devType.id, FilterType.DevType)}
                    />
                    {devType.name}
                  </label>
                </div>
              ))}
          </div>
          <div>
            Bus:
            {busFilters
              .map((bus) => (
                <div key={bus.id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={busFilterIds.includes(bus.id)}
                      onChange={() => handleCheckboxChange(bus.id, FilterType.Bus)}
                    />
                    {bus.name}
                  </label>
                </div>
              ))}
          </div>
        </div>
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-7 gap-2 px-4">
            <div className="col-auto sm:col-span-3">
              Name
            </div>
            <div className="col-auto sm:col-span-1">
              VID:PID
            </div>
            <div className="col-auto sm:col-span-1 flex sm:justify-center">
              Bus
            </div>
            <div className="col-auto sm:col-span-2">
              Device Type
            </div>
          </div>
          {filteredDeviceListEntries.map((info, index) => (
            <DeviceListEntry key={`${info.name}-${info.bus}-${index}`} {...info} />
          ))}
        </div>
      </div>
    </>
  );
}
