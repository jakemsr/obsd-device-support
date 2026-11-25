'use client'

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
    if (result.ok) {
      toast.success(result.data);
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div>
      Start new review
      <form onSubmit={handleSubmit}>
        <input type="hidden" name="reportId" value={reportId.toString()} />
        <input type="hidden" name="userId" value={userId} />
        <textarea
          name="note"
          placeholder="Write your review here..."
          className="w-80 h-20"
        />
        <Button type="submit">
          Save Review
        </Button>
      </form>
    </div>
  )
}

export default StartReview
