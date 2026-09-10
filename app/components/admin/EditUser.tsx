'use client'
import { useActionState } from 'react'
import type { User } from '@/app/generated/prisma/client'
import { roles } from '@/app/generated/prisma/enums'
import { updateRole } from '@/app/admin/manage_users/actions'
import { Button } from '@/app/components/Button'
import { updateRoleInitialState } from '@/lib/local-types'


export default function EditUser({ user }: { user: User }) {

  const [state, formAction, pending] = useActionState(updateRole, {
    ...updateRoleInitialState
  });

  return (
    <div>
      <form
        action={formAction}
        className="grid grid-cols-2 gap-2 max-w-fit"
      >
        <div className="font-bold">Email</div>
        <div>{user.email}</div>
        <input type="hidden" name="userId" value={user.id} />
        <div className="font-bold">Role</div>
        <div>
          <select name="role" defaultValue={user.role}>
            {Object.values(roles).map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
        <Button disabled={pending}>
          Save Changes
        </Button>
      </form>

      {state?.error && (
        <div className="mt-2 col-span-2 text-error">
          {state.error} {state.message}
        </div>
      )}

      {state?.success && (
        <div className="mt-2 col-span-2 text-success">
          {state.message}
        </div>
      )}

    </div>
  );
}
