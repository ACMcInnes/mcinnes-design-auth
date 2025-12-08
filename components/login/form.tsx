"use client";

import Link from "next/link";
import { useActionState } from "react";
import { redirect } from "next/navigation";
import { getWebstore } from "@/components/login/action";

const initialState = {
  message: "",
  webstore: "",
  environment: "",
};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(getWebstore, initialState);

  if (state?.webstore) {
    console.log(`webstore confirmed, authenticating...`);
    redirect(`/auth/callback/neto/v2?store_domain=${state.webstore}&environment=${state.environment}`);
  } else {
    return (
      <div className="max-w-xl lg:max-w-lg">
        <form action={formAction} className="mt-4 flex max-w-md gap-x-4">
          <label htmlFor="webstore" className="sr-only">
            Webstore URL
          </label>
          <input
            id="webstore"
            name="webstore"
            type="text"
            placeholder="https://domain.com.au"
            className="min-w-0 flex-auto rounded-md bg-white px-3.5 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:focus:outline-indigo-500"
          />
          <button
            type="submit"
            disabled={pending}
            className="flex-none rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
          >
            Lets Go!
          </button>

        </form>
        <p className="mt-2 text-sm/6 text-balance text-gray-600 dark:text-gray-400">
          <span className="align-top">*</span>
          Authentication is currently only available via the Neto eCommerce Platform.
        </p>
        <p className="mt-1 text-sm/6 text-gray-900 dark:text-gray-300">
          By submitting this form you accept our{' '}
          <Link
            href="/terms"
            className="font-semibold whitespace-nowrap text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            terms &amp; conditions
          </Link>
          .
        </p>
        <p aria-live="polite" className="mt-2 text-red-700 dark:text-red-400">
          {state?.message}
        </p>
      </div>
    );
  }
}
