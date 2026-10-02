'use client'

import { useState } from 'react'
import StartReview from "@/app/components/report-reviews/StartReview"
import { Button } from '@/app/components/Button'

interface StartReviewButtonProps {
  reportId: bigint;
  userId: string;
}

export default function StartReviewButton({ reportId, userId }: StartReviewButtonProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  return (
    <div className="space-y-4">
      <Button 
        onClick={() => setIsLoaded(!isLoaded)}
      >
        {isLoaded ? 'Hide' : 'Start New Review'}
      </Button>

      {/* Conditionally render the client component */}
      {isLoaded && <StartReview reportId={reportId} userId={userId} />}
    </div>
  )
}
