'use client' // Error boundaries must be Client Components
 
import Link from 'next/link'
import { useEffect } from 'react'
 
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])
 
  return (
    <div className="mx-auto max-w-7xl px-6 py-32 lg:px-8">
      <div className="relative isolate overflow-hidden bg-indigo-700 px-6 py-24 text-center shadow-2xl rounded-3xl px-16 dark:shadow-none dark:after:pointer-events-none dark:after:absolute dark:after:inset-0 dark:after:inset-ring dark:after:inset-ring-white/10 dark:after:rounded-3xl">
        <h2 className="text-4xl font-semibold tracking-tight text-balance text-white sm:text-5xl">
          Oops, that didn&apos;t work
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg/8 text-pretty text-indigo-200">
          Sorry about that, use one of the buttons below to get back on track &#129310;
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <button
            className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-indigo-600 shadow-xs hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white dark:shadow-none"
            onClick={
              // Attempt to recover by trying to re-render the segment
              () => reset()
            }
          >
            Try again
          </button>
          <Link
            href="/auth/callback/neto/uninstall"
            className="text-sm/6 font-semibold text-white"
          >
            Log out
          </Link>
        </div>
      </div>
    </div>
  );
}
