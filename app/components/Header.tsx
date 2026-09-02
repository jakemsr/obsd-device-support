"use client";

import { useState } from "react";
import Link from "next/link";
import NavDropDown from "./NavDropDown";
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
    <header className="w-full grid grid-cols-4 text-sm sm:text-base py-4 px-4 sm:px-8">
      <div className="flex col-span-1 items-center justify-start">
        <NavDropDown />
      </div>
      <div className="flex col-span-2 text-center justify-center">
        <span>OpenBSD Device Support Database</span>
      </div>
      <div className="flex col-span-1 items-center justify-end">
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
