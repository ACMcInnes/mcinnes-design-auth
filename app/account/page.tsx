'use server'

import Link from "next/link";
import Header from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import getCookie from "@/components/auth/getCookie";
import { accountPayload } from "@/components/types/interfaces";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/16/solid";
import Back from "@/components/shared/back";

export default async function Account() {

  const account = await getCookie('mc_design_auth') as accountPayload

  if(Object.keys(account).length) {

    const heading = `${account.webstore.business_name.charAt(0).toUpperCase()}${account.webstore.business_name.slice(1).replace(/(\.neto)?(\.maropost)?\.com(\.au)?\b/gi, '')}`
    const currentTimestamp = Date.now();

    let tokenExpiry: Date | string
    let refreshExpiry: Date | string
    let canRefresh: boolean
    let minutesRemaining: number
    let daysRemaining: number

    if(account.oauth.version === 2) {
      canRefresh = currentTimestamp >= account.oauth.expires_in ? true : false;
      minutesRemaining = Math.floor((account.oauth.expires_in - currentTimestamp) / 1000 / 60);
      daysRemaining = Math.floor((account.oauth.refresh_expires_in - currentTimestamp) / 1000 / 60 / 60 / 24);
      tokenExpiry = new Date(account.oauth.expires_in);
      refreshExpiry = new Date(account.oauth.refresh_expires_in);
    } else {
      canRefresh = false;
      minutesRemaining = 0;
      daysRemaining = 0;
      tokenExpiry = '-';
      refreshExpiry = '-';     
    }

    return (
      <div className="font-sans grid grid-row-[20px_1fr_20px] items-center justify-items-center min-h-screen px-8 gap-16 sm:px-20">
        <Header />
        <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
          <div className="max-w-4xl">
            <h1 className="mx-auto text-center mt-2 mb-8 max-w-xs sm:max-w-md md:max-w-xl lg:max-w-3xl text-balance text-4xl font-semibold text-gray-900 dark:text-gray-100 sm:text-5xl">
              <strong className="bg-black/[.05] dark:bg-white/[.06] font-mono font-semibold px-2 py-0.5 rounded wrap-break-word">
                {heading}
              </strong>
              {" "}Account
            </h1>
            <div>
              <div className="px-4 sm:px-0">
                <h3 className="text-base/7 font-semibold text-gray-900 dark:text-white">McInnes Design &lt;&gt; Neto</h3>
                <p className="mt-1 max-w-2xl text-sm/6 text-gray-500 dark:text-gray-400">See what Neto data the McInnes Design application has access too.</p>
              </div>
              <div className="mt-6 border-t border-gray-100 dark:border-white/10">
                <dl className="divide-y divide-gray-100 dark:divide-white/10">
                  <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm/6 font-medium text-gray-900 dark:text-gray-100">Name</dt>
                    <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0 dark:text-gray-400 break-all">{account.user.uid === account.user.preferred_username ? account.user.uid : `${account.user.preferred_username} (${account.user.uid})`}</dd>
                  </div>
                  <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm/6 font-medium text-gray-900 dark:text-gray-100">Email address</dt>
                    <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0 dark:text-gray-400">
                      {account.user.email}
                    </dd>
                  </div>
                  <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm/6 font-medium text-gray-900 dark:text-gray-100">Webstore name</dt>
                    <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0 dark:text-gray-400">{account.webstore.business_name}</dd>
                  </div>
                  <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm/6 font-medium text-gray-900 dark:text-gray-100">Webstore domain</dt>
                    <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0 dark:text-gray-400">
                      {account.webstore.domain}
                      <Link
                        href={`//${account.webstore.domain}`}
                        target="_blank"
                        className="ml-3 font-semibold whitespace-nowrap text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        <ArrowTopRightOnSquareIcon
                          className="inline-block size-6"
                        />
                      </Link>
                    </dd>
                  </div>
                  <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm/6 font-medium text-gray-900 dark:text-gray-100">Location</dt>
                    <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0 dark:text-gray-400">{account.webstore.country ? `${account.webstore.country} - ${account.webstore.timezone}` : `${account.webstore.timezone}`}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="pt-12">
              <div className="px-4 sm:px-0">
                <h3 className="text-base/7 font-semibold text-gray-900 dark:text-white">Developer Access</h3>
                <p className="mt-1 max-w-2xl text-sm/6 text-gray-500 dark:text-gray-400">The nitty gritty stuff</p>
              </div>
              <div className="mt-6 border-t border-gray-100 dark:border-white/10">
                <dl className="divide-y divide-gray-100 dark:divide-white/10">
                  <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm/6 font-medium text-gray-900 dark:text-gray-100">Webstore hash</dt>
                    <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0 dark:text-gray-400">{account.webstore.hash ?? '-'}</dd>
                  </div>
                  <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm/6 font-medium text-gray-900 dark:text-gray-100">API Scopes</dt>
                    <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0 dark:text-gray-400">
                      {account.oauth.scope}
                    </dd>
                  </div>
                  <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm/6 font-medium text-gray-900 dark:text-gray-100">API Token Expiry</dt>
                    <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0 dark:text-gray-400">{`${tokenExpiry} (${minutesRemaining >= 0 ? `~${minutesRemaining}` : '0'}mins)`}</dd>
                  </div>
                  <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm/6 font-medium text-gray-900 dark:text-gray-100">API Refresh Token Expiry</dt>
                    <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0 dark:text-gray-400">{`${refreshExpiry} (${daysRemaining >= 0 ? `~${daysRemaining}` : '0'}days)`}</dd>
                  </div>
                  <div className="px-4 py-6 grid grid-cols-3 gap-4 sm:px-0">
                    <dt className="text-sm/6 font-medium text-gray-900 dark:text-gray-100">API Access</dt>
                    <dd className="mt-1 text-sm/6 text-gray-700 col-span-2 mt-0 dark:text-gray-400 text-right">
                      {canRefresh ? (
                        <>
                          Expired
                          <Link
                            className="rounded-md bg-indigo-600 ml-5 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
                            href="/auth/callback/neto/refresh"
                          >
                            Refresh
                          </Link>
                        </>

                      ) : (
                        <>
                          Active
                          <button
                            className="rounded-md bg-indigo-600 ml-5 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:shadow-none dark:focus-visible:outline-indigo-500 opacity-50 cursor-not-allowed"
                            disabled
                          >
                            Refresh
                          </button>
                        </>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <Back />
          </div>
        </main>
        <Footer />
      </div>
    );
  } else {
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
            <p className="mt-6 text-base">
              <Link
                href="/"
                className="font-semibold whitespace-nowrap text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                {"<- Back to login"}
              </Link>
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
}
