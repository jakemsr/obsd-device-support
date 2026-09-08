"use client"

import { useState, use } from "react";
import Link from "next/link";
import type { ReportWithRelations } from "@/lib/local-types";


interface ListReportsProps {
  reportsPromise: Promise<ReportWithRelations[]>;
}

export default function ListReports({ reportsPromise }: ListReportsProps) {

  const reports = use(reportsPromise);

  const handleCheckboxChange = (id: number) => {
    setFilterIds((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id) // Uncheck: Remove ID
        : [...prev, id]                     // Check: Add ID
    );
  }

  const filters = [...new Set(reports.map(report => report.status))]
    .sort((a, b) => a.localeCompare(b))
    .map((filter, index) => ({ id: index, name: filter }));

  const [filterIds, setFilterIds] = useState<number[]>(filters.map(filter => filter.id));

  const filteredReports = reports.filter(
    (report) => filterIds.includes(filters.find(filter => filter.name === report.status)?.id ?? -1)
  );


  return (
    <div className="mx-4 flex gap-8">
      <div className="min-w-fit">
        Show:
        <div className="">
          {filters
            .map((filter) => (
              <div key={filter.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={filterIds.includes(filter.id)}
                    onChange={() => handleCheckboxChange(filter.id)}
                  />
                  {filter.name}
                </label>
              </div>
            ))}
        </div>
      </div>
      <div>
        <div>
          {filteredReports.length === 0 && (
            <p>No reports found.</p>
          )}
          {filteredReports.map(report => (
            <div
              key={report.id}
              className="border-t py-2 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-x-4"
            >
              <div>
                <Link
                  href={`/reports/${report.id}`}
                  className="text-link hover:underline"
                >
                  Report ID: {report.id}
                </Link>
              </div>
              <div>
                Status: {report.status}
              </div>
              <div className="col-span-2">
                Created At: {report.created_at.toLocaleString()}
              </div>
              <div className="col-span-2">
                Updated At: {report.updated_at.toLocaleString()}
              </div>
              <div className="col-span-2 lg:col-span-3">
                Sources: {report.sources.map(source => source.name).join(", ")}
              </div>
              <div className="col-span-2 lg:col-span-3">
                Reported Devices: {report.reported_devices.map(device => `${device.vendor_id}:${device.product_id}`).join(", ")}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div >
  );
}
