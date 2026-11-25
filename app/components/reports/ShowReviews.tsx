import type { AuthSession, ReportReview } from "@/lib/local-types";
import StartReviewButton from '@/app/components/report-reviews/StartReviewButton';
import { LinkButton } from '@/app/components/Button';
import { roles } from '@/app/generated/prisma/enums';
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
    !editingReviewId &&
    session?.user.role === roles.editor &&
    reviews.every(review => review.reviewer.id !== userId);

  return (
    <div className="mt-4">
      <div className="font-bold">
        Reviews:
      </div>
      <div className="px-4">
        {showReviews.length > 0 ? (
          <div className="sm:max-w-1/2">
          {showReviews.map((review, index) => (
            <div
              key={review.id}
              className="grid grid-cols-3"
            >
              <div className="font-bold col-span-3">
                Review #{index + 1}
              </div>
              <div className="font-bold col-span-1">
                Reviewer:
              </div>
              <div className="col-span-2">
                {review.reviewer.email}
              </div>
              <div className="font-bold col-span-1">
                Created At:
              </div>
              <div className="col-span-2">
                {review.created_at.toLocaleString()}</div>
              {review.completed_at && (
                <>
                <div className="font-bold col-span-1">
                  Completed At:
                </div>
                <div className="col-span-2">
                  {review.completed_at.toLocaleString()}
                </div>
                </>
              )}
              <div className="font-bold col-span-1">
                Notes:
              </div>
              <div className="col-span-2">
                {review.notes}
              </div>
              {review.reviewer_id === userId && review.completed_at === null && (
                <div className="col-span-3 w-fit mt-2">
                  <Link href={`/report-reviews/edit/${review.id}`}>
                    <LinkButton>
                      Update Review
                    </LinkButton>
                  </Link>
                </div>
              )}
            </div>
          ))}
          </div>
        ) : (
          <div>No reviews yet.</div>
      )}
        {addReview && (
          <div className="mt-4">
            <StartReviewButton reportId={reportId} userId={userId} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowReviews;
