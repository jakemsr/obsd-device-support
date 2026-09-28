'use client'

import type { FullReport } from "@/lib/local-types";
import { Button } from '@/app/components/Button'
import { submitReview } from "@/app/report-reviews/actions";
import { toast } from "sonner";


interface StartReviewProps {
  reportId: bigint;
  userId: string;
}

const StartReview = ({ reportId, userId }: StartReviewProps) => {

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const result = await submitReview(formData);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(`${result.error}: ${result.message}`);
    }
  };

  return (
    <div>
      <p>New review for report: {reportId}</p>
      <form onSubmit={handleSubmit}>
        <input type="hidden" name="reportId" value={reportId.toString()} />
        <input type="hidden" name="userId" value={userId} />
        <textarea
          name="note"
          placeholder="Write your review here..."
        />
        <Button type="submit">
          Save Review
        </Button>
      </form>
    </div>
  )
}

export default StartReview
