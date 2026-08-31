"use client";

import Link from "next/link";
import { BetterAuthForm } from "@/components/betterauth/form";
import { ArrowLeftIcon } from "@heroicons/react/16/solid";
import { authClient } from "@/lib/auth-client";

export default function CheckSession() {

  const { 
        data: session, 
        isPending,
        error,
        refetch
    } = authClient.useSession() 

  if (isPending) {
    return (
      <p className="text-base">
        Loading...
      </p>
    );  
  };

  if (error || !session) {
    return (
      <>
        <ol className="font-mono text-balance list-inside list-decimal text-sm/6 text-center sm:text-left">
          <li className="mb-2 tracking-[-.01em]">
            Enter your{" "}
            <strong className="bg-black/[.05] dark:bg-white/[.06] font-mono font-semibold px-1 py-0.5 rounded">
              Webstore URL
            </strong>
            {" "}to get started.
          </li>
          <li className="mb-2 tracking-[-.01em]">
            Log in to your platform portal if prompted.
          </li>
          <li className="tracking-[-.01em]">
            Review your connection with the McInnes Design application.
          </li>
        </ol>

        <BetterAuthForm />

        <Link
          className="mt-6 flex items-center gap-2 group hover:underline hover:underline-offset-4 font-semibold whitespace-nowrap text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          href="/developer"
        >
          <ArrowLeftIcon
            aria-hidden="true"
            className="inline-block size-4"
          />
          Developer Login
        </Link>
      </>
    );  
  } else {
    return (
      <>
        <p className="text-base">
          Hi {session.user.name}, you are already authenticated with Neto.
        </p>  
        <div className="flex items-center gap-x-6">
          <Link
            href="/account"
            className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
          >
            View Account
          </Link>
        </div>
      </>
    );  
  }
}
