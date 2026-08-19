"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import LoginModal from "./LoginModal";
import { SignOut } from "./SignOutButton";
import { Button, LoadingSpinner } from "./Button";


export default function Header() {

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const onModalClose = () => {
    setIsLoginModalOpen(false);
  }

  const {
    data: session,
    isPending,
    error,
    refetch
  } = authClient.useSession();

  return (
    <header className="w-full grid grid-cols-7 text-sm sm:text-base py-4 px-4 sm:px-8">
      <div className="flex items-center justify-start">
        <Link href="/" className="text-link hover:underline">Home</Link>
      </div>
      <div className="flex col-span-5 items-center justify-center">
        <span>OpenBSD Device Support Database</span>
      </div>
      <div className="flex items-center justify-end">
        {session ? (
          <SignOut />
        ) : (
          <>
            <Button onClick={() => setIsLoginModalOpen(true)} disabled={isPending}>
              {isPending && <LoadingSpinner />}
              Login
            </Button>
            {isLoginModalOpen && <LoginModal onModalClose={onModalClose} />}
          </>
        )}
      </div>
    </header>
  );
}
