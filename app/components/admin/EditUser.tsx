'use client'
import type { User } from '@/app/generated/prisma/client'
import { roles } from '@/app/generated/prisma/enums'
import { updateRole } from '@/app/admin/manage_users/actions'


export default function EditUser({ user }: { user: User }) {

  return (
    <div>
      <form
        action={updateRole}
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
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
          Save Changes
        </button>
      </form>
    </div>
  );
}
