import Link from "next/link";
import Header from "@/components/shared/header";
import Footer from "@/components/shared/footer";

export default function NotFound() {
  return (
    <div className="font-sans grid grid-row-[20px_1fr_20px] items-center justify-items-center min-h-screen px-8 gap-16 sm:px-20">
      <Header />
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="max-w-4xl text-center">
          <p className="text-base font-semibold text-indigo-600 dark:text-indigo-400">404</p>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl dark:text-white">
            Page not found
          </h1>
          <p className="mt-6 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8 dark:text-gray-400">
            &quot;You&apos;ve gone off the edge of the map&quot;, &quot;Not all those who wander are lost, but you are&quot;, etc etc ...
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/"
              className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
            >
              Go back home
            </Link>
            <Link href="//mcinnes.design/contact" target="_blank" className="text-sm font-semibold text-gray-900 dark:text-white">
              Contact McInnes Design -&gt;
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
