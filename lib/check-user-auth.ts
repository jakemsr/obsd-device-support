'use server'

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import type { AuthSession, AuthUser } from "@/lib/local-types";


export async function getSessionPromise(): Promise<AuthSession | null> {
  const sessionPromise = auth.api.getSession({
    headers: await headers()
  });
  return sessionPromise;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await getSessionPromise();

  if (!session || !session.user) {
    return null;
  }

  return session.user;
}

export async function getUserId(): Promise<string | null> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return null;
  }

  return currentUser.id;
}
