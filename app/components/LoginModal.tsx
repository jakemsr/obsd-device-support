"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button, LoadingSpinner } from "./Button"


enum SignInMode {
  none = "",
  GitHub = "GitHub",
  email = "email",
  signUp = "sign up",
  passwordReset = "password reset",
}

interface LoginModalProps {
  onModalClose: () => void;
}

const LoginModal = ({ onModalClose }: LoginModalProps) => {

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signMode, setSignMode] = useState<SignInMode>(SignInMode.email);
  const [authenticating, setAuthenticating] = useState<SignInMode>(SignInMode.none);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("");


  interface SignInProps {
    mode: SignInMode;
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
  }

  const SignIn = ({ mode, email, password, firstName, lastName }: SignInProps) => {

    const handleClick = async () => {
      setError(null);
      setAuthenticating(mode);
      let data, error;
      switch (mode) {
        case SignInMode.GitHub:
          ({data, error} = await authClient.signIn.social({
            provider: "github",
            callbackURL: window.location.origin + "/",
          }));
          break;
        case SignInMode.email:
          if (!email || !password) {
            error = new Error("Email and password are required");
            break;
          }
          ({data, error} = await authClient.signIn.email({
            email: email || "",
            password: password || "",
            callbackURL: window.location.origin + "/",
          }));
          break;
        case SignInMode.signUp:
          if (!firstName || !lastName || !email || !password) {
            error = new Error("All fields are required for sign up");
            break;
          }
          ({ data, error } = await authClient.signUp.email({
            name: `${firstName || ""} ${lastName || ""}`,
            firstName: firstName || "",
            lastName: lastName || "",
            email: email || "",
            password: password || "",
            callbackURL: window.location.origin + "/",
          }));
          break;
        case SignInMode.passwordReset:
          if (!email) {
            error = new Error("Email is required for password reset");
            break;
          }
          const resetURL = window.location.origin + "/reset-password";
          ({ data, error } = await authClient.requestPasswordReset({
            email,
            redirectTo: resetURL,
          }));
          break;
        default:
          throw new Error(`Unsupported sign in mode: ${mode}`);
      }
      if (error) {
        setError(error.message || null);
      } else {
        switch (mode) {
          case SignInMode.passwordReset:
            setMessage("Password reset email sent! Please check your inbox.");
            setSignMode(mode);
            break;
          case SignInMode.signUp:
            setMessage("Sign up successful! Please check your email to verify your account.");
            setSignMode(mode);
            break;
          default:
            setSignMode(SignInMode.email);
            onModalClose();
            break;
        }
      }
      setAuthenticating(SignInMode.none);
    }

    let buttonText = `Sign In with ${mode}`;
    if (mode === SignInMode.signUp) {
      buttonText = "Sign Up";
    } else if (mode === SignInMode.passwordReset) {
      buttonText = "Request Reset";
    }

    return (
      <Button onClick={handleClick} disabled={authenticating !== SignInMode.none}>
        {authenticating === mode && <LoadingSpinner />}
        {buttonText}
      </Button>
    )
  }


  return (
    <div
      className="fixed top-0 left-0 w-screen h-screen bg-black/75 flex justify-center items-center z-1000"
      onClick={onModalClose}
    >
      {message ? (
      <div className="border-2 rounded-lg w-96 flex flex-col items-center justify-center bg-black"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3 w-full flex justify-between">
          <div className="text-black px-2">X</div>
          <div>
            <h2 className="text-lg font-bold text-center capitalize">
              {signMode}
            </h2>
          </div>
          <Button onClick={onModalClose}>
            X
          </Button>
        </div>
        <div className="w-full px-4 pb-2 text-center">
          {message}
        </div>
      </div>

      ):(
      <div className="border-2 rounded-lg w-96 flex flex-col items-center justify-center bg-black"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3 w-full flex justify-between">
          <div className="text-black px-2">X</div>
          <div>
            <h2 className="text-lg font-bold text-center">
              {signMode === SignInMode.signUp ? "Sign Up" : "Login"}
            </h2>
          </div>
          <Button onClick={onModalClose}>
            X
          </Button>
        </div>

        {error && <div className="px-4 text-red-400">{error}</div>}

        {signMode !== SignInMode.signUp && (
          <>
            <div className="mt-2">
              <SignIn mode={SignInMode.GitHub} />
            </div>
            <div className="flex items-center mt-2 px-4 w-full">
              <div className="grow border-t border-gray-300"></div>
              <span className="shrink mx-2">OR</span>
              <div className="grow border-t border-gray-300"></div>
            </div>
          </>
        )}
        <div className="my-2 grid grid-cols-4 px-4 w-full gap-2 items-center">
          {signMode === SignInMode.signUp && (
            <>
              <div className="col-span-1">
                First Name
              </div>
              <div className="col-span-3">
                <input
                  type="text"
                  name="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="border-2 rounded-md p-1 mt-1"
                />
              </div>
              <div className="col-span-1">
                Last Name
              </div>
              <div className="col-span-3">
                <input
                  type="text"
                  name="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="border-2 rounded-md p-1 mt-1"
                />
              </div>
            </>
          )}
          <div className="col-span-1">
            Email
          </div>
          <div className="col-span-3">
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-2 rounded-md p-1 mt-1"
            />
          </div>
          <div className="col-span-1">
            Password
          </div>
          <div className="col-span-3">
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-2 rounded-md p-1 mt-1"
            />
          </div>
        </div>
        <SignIn
          mode={signMode}
          email={email}
          password={password}
          firstName={firstName}
          lastName={lastName}
        />
        <div className="mt-2">
          <span onClick={() => {setError(""); setSignMode(signMode === SignInMode.signUp ? SignInMode.email : SignInMode.signUp)}} className="cursor-pointer">
            {signMode === SignInMode.signUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
          </span>
        </div>
        <div className="my-2">
          Forgot Password?
          <SignIn mode={SignInMode.passwordReset} email={email} />
        </div>
      </div>
      )}
    </div>
  );
}

export default LoginModal;
