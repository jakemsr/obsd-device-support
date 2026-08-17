import type { DeviceListEntryProps } from "@/lib/local-types";

export default function DeviceListEntry({ name, bus, devType, vid, pid }: DeviceListEntryProps) {
  return (
    <div className="grid grid-cols-2 border-t sm:grid-cols-7 gap-2 px-4">
      <div className="col-auto sm:col-span-3">
        {name}
      </div>
      <div className="col-auto sm:col-span-1">
        {vid}:{pid}
      </div>
      <div className="col-auto sm:col-span-1 flex sm:justify-center">
        {bus}
      </div>
      <div className="col-auto sm:col-span-2">
        {devType}
      </div>
    </div>
  )
}