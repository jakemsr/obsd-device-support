import type { DeviceListEntryProps } from "@/lib/local-types";

export default function DeviceListEntry({ name, bus, devType, vid, pid }: DeviceListEntryProps) {
  return (
    <div className="grid grid-cols-1 border-t border-foreground sm:grid-cols-8 sm:gap-2 px-4 text-link hover:underline">
      <div className="col-auto sm:col-span-3">
        {name}
      </div>
      <div className="col-auto sm:col-span-2">
        {vid}:{pid}
      </div>
      <div className="col-auto sm:col-span-1">
        {bus}
      </div>
      <div className="col-auto sm:col-span-2">
        {devType}
      </div>
    </div>
  )
}