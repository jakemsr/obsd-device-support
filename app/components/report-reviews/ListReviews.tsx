'use client'

import { use, useState } from "react";
import Link from "next/link";
import type { ReportReview } from "@/lib/local-types";


interface ListReviewsProps {
  reviewsPromise: Promise<ReportReview[]>;
}

const ListReviews = ({ reviewsPromise }: ListReviewsProps) => {

  const reviews = use(reviewsPromise);

  const [showOpened, setShowOpened] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);

  const filteredReviews = reviews.filter(review =>
    (showOpened && !review.completed_at) || (showCompleted && review.completed_at)
  );

  return (
    <div className="flex gap-4">
      <div>
        Show:
        <div className="flex flex-col">
          <div className="flex gap-2">
            <input
              type="checkbox"
              name="opened"
              checked={showOpened}
              onChange={() => setShowOpened(!showOpened)}
            />
            Opened
          </div>
          <div className="flex gap-2">
            <input
              type="checkbox"
              name="completed"
              checked={showCompleted}
              onChange={() => setShowCompleted(!showCompleted)}
            />
            Completed
          </div>
        </div>
      </div>

      <div>
        {filteredReviews.length === 0 ? (
          <p>No reviews to display.</p>
        ) : (
          filteredReviews.map((review) => (
            <div
              key={review.id}
              className="grid grid-cols-2 border-t py-2"
            >
              <div>
                <Link
                  href={`/reports/${review.report.id}`}
                  className="text-link hover:underline"
                >
                  Report ID: {review.report.id}
                </Link>
              </div>
              <div>
                Reviewer: {review.reviewer.email}
              </div>
              <div>
                Created at: {review.created_at.toDateString()}
              </div>
              <div>
                Completed at: {review.completed_at ? review.completed_at.toDateString() : 'Not completed'}
              </div>
              <div className="col-span-2">
                Notes: {review.notes}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ListReviews;