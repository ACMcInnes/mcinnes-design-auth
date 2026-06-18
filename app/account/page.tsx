"use client";

import Link from "next/link";
import Header from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import { authClient } from "@/lib/auth-client"
import { useRouter } from 'next/navigation';
import { useTransition } from 'react'
import Back from "@/components/shared/back";

export default function Account() {
  const router = useRouter();

  const signoutSession = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
        },
      },
    });
  };

  const [isRefreshing, startTransition] = useTransition()
  const checkAccessToken = async () => {
    startTransition(async () => {
      console.log(`TOKEN`)
      const accessToken = await authClient.getAccessToken({
        providerId: "neto", // or any other provider id
      })
      console.log(accessToken)
    })
  };

  const { 
    data: session, 
    isPending,
    error,
  } = authClient.useSession() 

  if (isPending) {
    return (
      <div className="font-sans grid grid-row-[20px_1fr_20px] items-center justify-items-center min-h-screen px-8 gap-16 sm:px-20">
        <Header />
        <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
          <div className="max-w-4xl">
            <h1 className="mx-auto text-center mt-2 mb-8 text-balance text-4xl font-semibold text-gray-900 dark:text-gray-100 sm:text-5xl">
              Account
            </h1>
            <p className="text-base">
              Loading...
            </p>
            <Back />
          </div>
        </main>
        <Footer />
      </div>
    ); 
  };

  if (error || !session) {
    return (
      <div className="font-sans grid grid-row-[20px_1fr_20px] items-center justify-items-center min-h-screen px-8 gap-16 sm:px-20">
        <Header />
        <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
          <div className="max-w-4xl">
            <h1 className="mx-auto text-center mt-2 mb-8 text-balance text-4xl font-semibold text-gray-900 dark:text-gray-100 sm:text-5xl">
              Account
            </h1>
            <p className="text-base">
              Looks like we are missing your details, try logging in again
            </p>
            <Back />
          </div>
        </main>
        <Footer />
      </div>
    );    
  };

  return (
    <div className="font-sans grid grid-row-[20px_1fr_20px] items-center justify-items-center min-h-screen px-8 gap-16 sm:px-20">
      <Header />
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="max-w-4xl">
          <h1 className="mx-auto text-center mt-2 mb-8 max-w-xs sm:max-w-md md:max-w-xl lg:max-w-3xl text-balance text-4xl font-semibold text-gray-900 dark:text-gray-100 sm:text-5xl">
            <strong className="bg-black/[.05] dark:bg-white/[.06] font-mono font-semibold px-2 py-0.5 rounded wrap-break-word">
              {session.user.name}
            </strong>{" "}
            Account
          </h1>
          <div>
            <div className="px-4 sm:px-0">
              <h3 className="text-base/7 font-semibold text-gray-900 dark:text-white">
                McInnes Design &lt;&gt; Neto
              </h3>
              <p className="mt-1 max-w-2xl text-sm/6 text-gray-500 dark:text-gray-400">
                See what Neto data the McInnes Design application has access
                too. For details around how this is used, refer to our{" "}
                <Link
                  className="hover:underline hover:underline-offset-4 font-semibold whitespace-nowrap text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                  href="/terms"
                >
                  terms &amp; conditions
                </Link>
                .
              </p>
            </div>
            <div className="mt-6 border-t border-gray-100 dark:border-white/10">
              <dl className="divide-y divide-gray-100 dark:divide-white/10">
                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                  <dt className="text-sm/6 font-medium text-gray-900 dark:text-gray-100">
                    Name
                  </dt>
                  <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0 dark:text-gray-400 break-all">
                    {session.user.name}
                  </dd>
                </div>
                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                  <dt className="text-sm/6 font-medium text-gray-900 dark:text-gray-100">
                    Email address
                  </dt>
                  <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0 dark:text-gray-400">
                    {session.user.email}
                  </dd>
                </div>
                <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                  <dt className="text-sm/6 font-medium text-gray-900 dark:text-gray-100">
                    ID
                  </dt>
                  <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0 dark:text-gray-400">
                    {session.user.id}
                  </dd>
                </div>
                <div className="px-4 py-6 grid grid-cols-3 gap-4 sm:px-0">
                  <dt className="text-sm/6 font-medium text-gray-900 dark:text-gray-100">
                    API Access
                  </dt>
                  <dd className="mt-1 text-sm/6 text-gray-700 col-span-2 mt-0 dark:text-gray-400 text-right">
                    <>
                      Active
                      <button
                        onClick={checkAccessToken}
                        disabled={isRefreshing}
                        className="rounded-md bg-indigo-600 ml-5 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
                      >
                        {isRefreshing ? 'Refreshing...' : 'Refresh'}
                      </button>
                    </>
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="my-24 bg-red-50 shadow-sm sm:rounded-lg dark:bg-red-500/15 dark:shadow-none dark:outline dark:-outline-offset-1 dark:outline-red-500/25">
            <div className="px-4 py-5 sm:p-6">
              <h3 id="danger-zone" className="text-base font-semibold text-red-800 dark:text-red-200">
                Danger Zone
              </h3>
              <div className="mt-2 sm:flex sm:items-start sm:justify-between">
                <div className="max-w-xl text-sm md:text-balance text-red-700 dark:text-red-200/80">
                  <p>
                    Disconnect your platform from McInnes Design. This action
                    cannot be undone. All information related to your account
                    will be deleted.
                  </p>
                </div>
                <div className="mt-5 sm:mt-0 sm:ml-6 sm:flex sm:shrink-0 sm:items-center">
                  <button
                    onClick={signoutSession}
                    className="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 dark:bg-red-500 dark:shadow-none dark:hover:bg-red-400 dark:focus-visible:outline-red-500"
                  >
                    Yes, delete my account
                  </button>
                </div>
              </div>
            </div>
          </div>

          <Back />
        </div>
      </main>
      <Footer />
    </div>
  );
}
