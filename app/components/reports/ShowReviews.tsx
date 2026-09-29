import type { AuthSession, ReportReview } from "@/lib/local-types";
import StartReviewButton from '@/app/components/report-reviews/StartReviewButton';
import { LinkButton } from '@/app/components/Button';
import Link from 'next/link';


interface ShowReviewsProps {
  reviewsPromise: Promise<ReportReview[]>;
  sessionPromise: Promise<AuthSession | null>;
  reportId: bigint;
  editingReviewId?: bigint;
}

const ShowReviews = async ({ reviewsPromise, sessionPromise, reportId, editingReviewId }: ShowReviewsProps) => {

  const reviews = await reviewsPromise;
  const showReviews = reviews.filter(review => review.id !== editingReviewId);

  const session = await sessionPromise;

  const userId = session?.user?.id ?? '';

  const addReview = userId !== '' &&
    reviews.every(review => review.reviewer.id !== userId);

  return (
    <div className="px-4">
      {showReviews.length > 0 && (
        <div className="mt-4">
          Reviews:
          {showReviews.map((review, index) => (
            <div
              className="px-4 border-t"
              key={review.id}
            >
              Review #{index + 1}
              <div>Reviewer: {review.reviewer.email}</div>
              <div>Created At: {review.created_at.toDateString()}</div>
              {review.completed_at && (
                <div>Completed At: {review.completed_at.toDateString()}</div>
              )}
              <div>Notes: {review.notes}</div>
              {review.reviewer_id === userId && review.completed_at === null && (
                <div>
                  <Link href={`/report-reviews/edit/${review.id}`}>
                    <LinkButton>
                      Update Review
                    </LinkButton>
                  </Link>
                </div>
              )}
            </div>
          ))}
          {addReview && (
            <div className="mt-4">
              <StartReviewButton reportId={reportId} userId={userId} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ShowReviews;
