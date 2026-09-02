'use client'

import { useState } from 'react'
import EditUser from './EditUser'
import type { User } from '@/app/generated/prisma/client'


export default function EditUserButton({user}: {user: User}) {
  const [isLoaded, setIsLoaded] = useState(false)

  return (
    <div className="space-y-4">
      <button 
        onClick={() => setIsLoaded(!isLoaded)}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {isLoaded ? 'Hide' : 'Edit User'}
      </button>

      {/* Conditionally render the client component */}
      {isLoaded && <EditUser user={user} />}
    </div>
  )
}
