import Header from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import Link from "next/link";

export default function Logout() {
  return (
    <div className="font-sans grid grid-row-[20px_1fr_20px] items-center justify-items-center min-h-screen px-8 gap-16 sm:px-20">
      <Header />
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="max-w-4xl">
          <h1 className="mx-auto text-center mt-2 mb-8 text-balance text-4xl font-semibold text-gray-900 dark:text-gray-100 sm:text-5xl">
            Logout
          </h1>
          <p className="text-base">
            You have been logged out of the McInnes Design application.
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
