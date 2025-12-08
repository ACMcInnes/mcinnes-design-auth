import Header from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import Link from "next/link";
import getCookie from "@/components/auth/getCookie";
import { LoginForm } from "@/components/login/form";
import { accountPayload } from "@/components/types/interfaces";

export default async function Home() {
  const account = await getCookie('mc_design_auth') as accountPayload
  if(Object.keys(account).length) {
    return (
      <div className="font-sans grid grid-row-[20px_1fr_20px] items-center justify-items-center min-h-screen px-8 gap-16 sm:px-20">
        <Header />
        <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
          <h1 className="text-4xl font-semibold tracking-tight text-gray-900 dark:text-white">McInnes Design AUTH</h1>
          <p className="text-base">
            Hi {account.user.uid}, you are already authenticated with {' '}
            <strong className="bg-black/[.05] dark:bg-white/[.06] font-mono font-semibold px-1 py-0.5 rounded">
              {account.webstore.domain}
            </strong>
            .
          </p>  
          <div className="flex items-center gap-x-6">
            <Link
              href="/account"
              className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
            >
              View Account
            </Link>
            <Link href="/auth/callback/neto/uninstall" className="text-sm/6 font-semibold text-gray-900 dark:text-gray-300 dark:hover:text-white">
              Log out
            </Link>
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
          <h1 className="text-4xl font-semibold tracking-tight text-gray-900 dark:text-white">McInnes Design AUTH</h1>
          <ol className="font-mono list-inside list-decimal text-sm/6 text-center sm:text-left">
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

          <LoginForm />

        </main>
        <Footer />
      </div>
    );    
  }
}
