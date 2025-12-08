'use server'

import Link from "next/link";
import Header from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import getCookie from "@/components/auth/getCookie";
import { accountPayload } from "@/components/types/interfaces";

export default async function Account() {

  const account = await getCookie('mc_design_auth') as accountPayload

  if(Object.keys(account).length) {
    return (
      <div className="font-sans grid grid-row-[20px_1fr_20px] items-center justify-items-center min-h-screen px-8 gap-16 sm:px-20">
        <Header />
        <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
          <div className="max-w-4xl">
            <h1 className="mx-auto text-center mt-2 mb-8 text-balance text-4xl font-semibold text-gray-900 dark:text-gray-100 sm:text-5xl">
              Account
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
                    <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0 dark:text-gray-400">{account.user.uid === account.user.preferred_username ? account.user.uid : `${account.user.preferred_username} (${account.user.uid})`}</dd>
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
                    <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0 dark:text-gray-400">{account.webstore.domain}</dd>
                  </div>
                  <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm/6 font-medium text-gray-900 dark:text-gray-100">Webstore hash</dt>
                    <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0 dark:text-gray-400">{account.webstore.hash}</dd>
                  </div>
                  <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm/6 font-medium text-gray-900 dark:text-gray-100">Location</dt>
                    <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0 dark:text-gray-400">{`${account.webstore.country} - ${account.webstore.timezone}`}</dd>
                  </div>
                  <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm/6 font-medium text-gray-900 dark:text-gray-100">API Scopes</dt>
                    <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0 dark:text-gray-400">
                      {account.oauth.scope}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
            <p className="mt-6 text-base">
              <Link
                href="/"
                className="font-semibold whitespace-nowrap text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                {"<- Back"}
              </Link>
            </p>
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
