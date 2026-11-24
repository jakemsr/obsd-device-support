"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button, LoadingSpinner } from "@/app/components/Button";


export const SignOut = () => {

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
          router.refresh();
        }
      }
    });
    setLoading(false);
  }

  return (
    <Button onClick={handleClick} disabled={loading}>
      {loading && <LoadingSpinner />}
      Logout
    </Button>
  )
}
