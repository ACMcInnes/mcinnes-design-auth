"use client";

import { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Header from "@/components/shared/header";
import Footer from "@/components/shared/footer";

function NetoSignIn() {
  const searchParams = useSearchParams();
  const startedRef = useRef(false);

  useEffect(() => {
    const webstore = searchParams.get("store_domain") ?? "";
    const redirectParam = searchParams.get("redirect") ?? "";
    const redirect = decodeURIComponent(atob(redirectParam))

    if (!webstore || startedRef.current) return;

    startedRef.current = true;

    void authClient.signIn.oauth2({
      providerId: "neto",
      callbackURL: redirect ? redirect : "/account",
      additionalData: { store_domain: webstore },
    });
  }, [searchParams]);

  return (
    <div className="font-sans grid grid-row-[20px_1fr_20px] items-center justify-items-center min-h-screen px-8 gap-16 sm:px-20">
      <Header />
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="max-w-4xl">
          <h1 className="mx-auto text-center mt-2 mb-8 text-balance text-4xl font-semibold text-gray-900 dark:text-gray-100 sm:text-5xl">
            Account
          </h1>
          <p className="text-base">
            Checking in with Neto...
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
 
export default function AuthNeto() {
  return (
    <Suspense>
      <NetoSignIn />
    </Suspense>
  )
}
