'use client'

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FullDeviceInfo, ReportReview } from "@/lib/local-types";
import { Button } from "@/app/components/Button";
import { updateReview } from "@/app/report-reviews/edit/[id]/actions";
import { getMatchedDevices, getReportDevices } from "@/app/reports/[id]/actions"


interface EditReviewProps {
  review: ReportReview
}

const EditReview = ({ review }: EditReviewProps) => {

  const [matchedDevices, setMatchedDevices] = useState<Map<bigint, FullDeviceInfo[]> | null>(null);

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
    const result = await updateReview(formData);
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
          <form className="px-4 flex flex-col gap-2" onSubmit={handleSubmit}>
            <input type="hidden" name="reviewId" value={review.id.toString()} />
            <div className="flex items-center">
              Review Notes:
              <textarea
                name="notes"
                defaultValue={review.notes ?? ""}
                className="min-w-fit h-20"
              />
            </div>
            <div>
              Review Completed:
              <input type="checkbox" name="completed" defaultChecked={review.completed_at !== null} />
            </div>
            <div>
              <Button type="submit">Save Review</Button>
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
