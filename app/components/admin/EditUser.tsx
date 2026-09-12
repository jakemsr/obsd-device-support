'use client'

import { useState } from 'react'
import type { User } from '@/app/generated/prisma/client'
import { roles } from '@/app/generated/prisma/enums'
import { updateRole, RoleActionState } from '@/app/admin/manage_users/actions'
import { Button, LoadingSpinner } from '@/app/components/Button'
import { InitialActionState } from '@/lib/local-types'


export default function EditUser({ user }: { user: User }) {

  const initialRoleActionState: RoleActionState = {
    ...InitialActionState,
    role: user.role
  };

  const [loading, setLoading] = useState(false);
  const [resultState, setResultState] = useState<RoleActionState>(initialRoleActionState);

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const result = await updateRole(initialRoleActionState, formData);
    setResultState(result);
    setLoading(false);
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-2 gap-2 max-w-fit"
      >
        <div className="font-bold">Email</div>
        <div>{user.email}</div>
        <input type="hidden" name="userId" value={user.id} />
        <div className="font-bold">Role</div>
        <div>
          <select name="role" defaultValue={resultState.role}>
            {Object.values(roles).map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
        <Button disabled={loading}>
          {loading && <LoadingSpinner />}
          Save Changes
        </Button>
      </form>

      {resultState.error && (
        <div className="mt-2 col-span-2 text-error">
          {resultState.error} {resultState.message}
        </div>
      )}

      {resultState.success && (
        <div className="mt-2 col-span-2 text-success">
          {resultState.message}
        </div>
      )}

    </div>
  );
}
