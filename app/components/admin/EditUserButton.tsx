'use client'

import { useState } from 'react'
import EditUser from './EditUser'
import type { User } from '@/app/generated/prisma/client'
import { Button } from '@/app/components/Button'


export default function EditUserButton({user}: {user: User}) {
  const [isLoaded, setIsLoaded] = useState(false)

  return (
    <div className="space-y-4">
      <Button 
        onClick={() => setIsLoaded(!isLoaded)}
      >
        {isLoaded ? 'Hide' : 'Edit User'}
      </Button>

      {/* Conditionally render the client component */}
      {isLoaded && <EditUser user={user} />}
    </div>
  )
}
