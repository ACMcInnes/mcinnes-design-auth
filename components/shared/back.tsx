import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/16/solid";

export default function Back() {
  return (
    <Link
      className="mt-6 flex items-center gap-2 group hover:underline hover:underline-offset-4 font-semibold whitespace-nowrap text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
      href="/"
    >
      <ArrowLeftIcon
        aria-hidden="true"
        className="inline-block size-4"
      />
      Back
    </Link>
  );
}
