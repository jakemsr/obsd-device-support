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
  }, [review.report_id]);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setLoading(true);
    const result = await updateReview(formData);
    setLoading(false);
    if (result.ok) {
      toast.success(result.data);
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="px-4 mt-2">
      <div className="font-bold">
        Edit Review:
      </div>
      <div className="grid grid-cols-2 py-2">
        <div>
          <form className="px-4 grid grid-cols-3" onSubmit={handleSubmit}>
            <input type="hidden" name="reviewId" value={review.id.toString()} />
            <div className="col-span-3 font-bold">
              Notes:
            </div>
            <div className="col-span-3">
              <textarea
                name="notes"
                defaultValue={review.notes ?? ""}
                className="w-80 h-20"
              />
            </div>
            <div className="font-bold">
              Completed:
            </div>
            <div className="col-span-2">
              <input type="checkbox" name="completed" defaultChecked={review.completed_at !== null} />
            </div>
            <div className="font-bold">
              Status:
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
          <div className="font-bold">
            Matched Devices:
          </div>
          {matchedDevices ? (
            Array.from(matchedDevices.entries()).map(([deviceId, devices]) => (
              <div
                key={deviceId.toString()}
                className="px-4 py-2"
              >
                <ul>
                  {devices.map((device) => (
                    <li key={device.id.toString()}>
                      {device.vendors.name} {device.name}
                      &nbsp;
                      <Link
                        href={`/device/edit/${device.id.toString()}`}
                        target="_blank"
                        className="text-link hover:underline"
                      >
                        Edit
                      </Link>
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
