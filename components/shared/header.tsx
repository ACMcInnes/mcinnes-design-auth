import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="pt-6 flex flex-col gap-[32px] size-full max-w-[1728px] row-start-1 justify-start items-center sm:items-start">
      <nav className="flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex flex-row gap-[12]">
            <span className="sr-only">McInnes Design AUTH</span>
            <Image
              aria-hidden
              src="/md_icon.svg"
              alt="McInnes Design Icon"
              className="fill-blue-500"
              width={64}
              height={64}
              unoptimized
              priority
            />
          </Link>
      </nav>
    </header>
  );
}
