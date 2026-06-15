"use client";

import { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function AuthNeto() {
  const searchParams = useSearchParams();
  const startedRef = useRef(false);

  useEffect(() => {
    const webstore = searchParams.get("store_domain") ?? "";
    if (!webstore || startedRef.current) return;

    startedRef.current = true;

    void authClient.signIn.oauth2({
      providerId: "neto",
      callbackURL: "/account",
      additionalData: { store_domain: webstore },
    });
  }, [searchParams]);

  return (
    <Suspense fallback={<p>Checking…</p>}>
      <p>Redirecting to Neto…</p>
    </Suspense>
  );
}