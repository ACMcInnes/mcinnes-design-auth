import Link from "next/link";
import Header from "@/components/shared/header";
import Footer from "@/components/shared/footer";

export default function Terms() {
  return (
    <div className="font-sans grid grid-row-[20px_1fr_20px] items-center justify-items-center min-h-screen px-8 gap-16 sm:px-20">
      <Header />
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="max-w-4xl">
          <h1 className="mx-auto text-center mt-2 mb-8 text-balance text-4xl font-semibold text-gray-900 dark:text-gray-100 sm:text-5xl">
            Terms of Use
          </h1>
          <p className="text-base">
            This application is currently in development, by entering any personal
            or identifiable information you consent to said information being used
            for the purposes and functions of this application.
          </p>
          <p className="mt-2">This includes but is not limited to:</p>

          <ul className="list-disc list-inside mt-2 ml-2">
            <li key="usage-0">Generating and storing API access credentials</li>
            <li key="usage-1">
              Accessing additional webstore information via the Neto API
            </li>
            <li key="usage-2">
              Displaying and using that data within this application
            </li>
          </ul>
          <p className="mt-6 text-base">
            Any data entered is only stored for the length of the browser session
            and is not shared with any 3rd parties. If you do not agree with these
            terms do not enter any personal or identifiable information into this
            application. By navigating and/or visiting this application some usage
            data may be recorded.
          </p>
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
}
