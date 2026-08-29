"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button, LoadingSpinner } from "@/app/components/Button";


const ResetPassword = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleReset = async () => {
    setLoading(true);
    if (!password) {
      setError("Password is required");
      setLoading(false);
      return;
    }
    const { data, error } = await authClient.resetPassword({
      newPassword: password,
      token,
    });
    if (error && error.message) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  }


  return (
    <>
      {token ? (
        <div>
          <h1>Reset Password Page</h1>
          <div className="mt-4 flex gap-4 items-center">
            {success ? (
              <div className="">
                Password reset successfully. You may now log in with new password.
              </div>
            ) : (
              <>
            <div className="">New Password</div>
            <div className="">
              <input
                id="new-password"
                type="password"
                value={password}
                required={true}
                onChange={(e) => setPassword(e.target.value)}
                className="border-2 rounded-md p-1 mt-1 col-span-3"
              />
            </div>
            <div className="">
              <Button onClick={handleReset} disabled={loading}>
                {loading && <LoadingSpinner />}
                Reset Password
              </Button>
              {error && <div className="text-red-500 mt-2">{error}</div>}
            </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div>
          Invalid or missing token
        </div>
      )}
    </>
  )
}

export default function ResetPasswordPage() {

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPassword />
    </Suspense>
  );
}
