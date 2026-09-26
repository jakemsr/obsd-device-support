import { auth } from '@/lib/auth';
import { headers } from 'next/headers';


export async function checkUserAuth(userId: string): Promise<boolean> {

  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session || !session.user || session.user.id !== userId) {
    return false;
  }

  return true;
}
