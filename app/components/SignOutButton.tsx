"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button, LoadingSpinner } from "./Button";


export const SignOut = () => {

  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    await authClient.signOut();
    setLoading(false);
  }

  return (
    <Button onClick={handleClick} disabled={loading}>
      {loading && <LoadingSpinner />}
      Sign Out
    </Button>
  )
}
