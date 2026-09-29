'use client'

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FullDeviceInfo, ReportReview } from "@/lib/local-types";
import { Button, LoadingSpinner } from "@/app/components/Button";
import { updateReview } from "@/app/report-reviews/edit/[id]/actions";
import { getMatchedDevices, getReportDevices } from "@/app/reports/[id]/actions"
import { report_status } from "@/app/generated/prisma/enums";


interface EditReviewProps {
  review: ReportReview
}

const EditReview = ({ review }: EditReviewProps) => {

  const [matchedDevices, setMatchedDevices] = useState<Map<bigint, FullDeviceInfo[]> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMatchedDevices = async () => {
      const reportDevices = await getReportDevices(review.report_id);

      if (reportDevices.length > 0) {
        const matchedDevices: Map<bigint, FullDeviceInfo[]> = await getMatchedDevices(reportDevices);
        setMatchedDevices(matchedDevices);
      }
    };
    fetchMatchedDevices();
  }, []);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setLoading(true);
    const result = await updateReview(formData);
    setLoading(false);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.error + " " + result.message);
    }
  };

  return (
    <div className="px-4 mt-2">
      Edit Review:
      <div className="grid grid-cols-2 border-t py-2">
        <div>
          <form className="px-4 grid grid-cols-3 gap-2" onSubmit={handleSubmit}>
            <input type="hidden" name="reviewId" value={review.id.toString()} />
            <div>
              Review Notes:
            </div>
            <div className="col-span-2">
              <textarea
                name="notes"
                defaultValue={review.notes ?? ""}
                className="w-80 h-20"
              />
            </div>
            <div>
              Review Completed:
            </div>
            <div className="col-span-2">
              <input type="checkbox" name="completed" defaultChecked={review.completed_at !== null} />
            </div>
            <div>
              Report Status:
            </div>
            <div className="col-span-2">
              <select name="reportStatus" defaultValue={review.report.status ?? ""} >
                {Object.values(report_status).map(value =>
                  <option key={value} value={value}>
                    {value.split("_").join(" ")}
                  </option>
                )}
              </select>
            </div>
            <div>
              <Button type="submit" disabled={loading}>
                {loading && <LoadingSpinner />}
                Save Review
              </Button>
            </div>
          </form>
        </div>
        <div>
          Matched Devices:
          {matchedDevices ? (
            Array.from(matchedDevices.entries()).map(([deviceId, devices]) => (
              <div
                key={deviceId.toString()}
                className="px-4 py-2"
              >
                <ul>
                  {devices.map((device) => (
                    <li key={device.id.toString()}>
                      <Link
                        href={`/device/edit/${device.id.toString()}`}
                        target="_blank"
                        className="text-link hover:underline"
                      >
                        Edit Device {device.id.toString()}:
                      </Link>
                      <br />
                      {device.vendors.name} {device.name}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <div>Loading matched devices...</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EditReview;
