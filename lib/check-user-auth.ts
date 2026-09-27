'use server'

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import type { AuthUser } from "@/lib/local-types";


export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session || !session.user) {
    return null;
  }

  return session.user;
}

export async function getUserId(): Promise<string | null> {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session || !session.user) {
    return null;
  }

  return session.user.id;
}

export async function checkUserAuth(userId: string): Promise<boolean> {

  const currentUserId = await getUserId();
  if (currentUserId !== userId) {
    return false;
  }

  return true;
}
