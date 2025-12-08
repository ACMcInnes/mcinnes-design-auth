import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="row-start-3 mt-auto flex gap-[24px] flex-wrap items-end justify-center">
      <nav className="w-full flex gap-[24px] flex-wrap items-center justify-center">
        <Link
          className="flex items-center gap-2 group hover:underline hover:underline-offset-4"
          href="//status.mcinnes.design"
          target="_blank"
        >
          <div
            className={`group-hover:animate-pulse text-green-400 bg-green-400/10 flex-none rounded-full p-1`}
          >
            <div className="size-3 rounded-full bg-current"></div>
          </div>
          Platform Status
        </Link>
        <Link
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="//mcinnes.design"
          target="_blank"
        >
          <Image
            aria-hidden
            src="/md_icon.svg"
            alt="McInnes Design Icon"
            width={16}
            height={16}
            unoptimized
          />
          Go to mcinnes.design -&gt;
        </Link>
      </nav>
      <Image
        className="dark:invert"
        src="/mcinnes_design_header.svg"
        alt="Next.js logo"
        width={1728}
        height={280}
        unoptimized
      />
      <div className="w-full max-w-[1728px] flex mb-2 sm:gap-[24px] flex-wrap items-center justify-between">
        <p className="text-center text-sm/6 text-gray-600 dark:text-gray-300">
          &copy; {new Date().getFullYear()} &#124; McInnes Design &bull; ABN: 32 205 159 015
        </p>
        <p className="text-center text-sm/6 text-gray-600 dark:text-gray-300">version &#35;{process.env.version}</p>
      </div>
      
    </footer>
  );
}
