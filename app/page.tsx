import Header from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import CheckSession from "@/components/betterauth/checkSession";
import { headers } from 'next/headers'

export default async function Home() {

  const headersList = await headers()
  const referrerHeader = headersList.get('referer') ?? ''
  const referrer = referrerHeader.includes('mcinnes.design') ? referrerHeader : ''

  console.log(`referrer: ${referrer}`)

  return (
    <div className="font-sans grid grid-row-[20px_1fr_20px] items-center justify-items-center min-h-screen px-8 gap-16 sm:px-20">
      <Header />
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-semibold tracking-tight text-gray-900 dark:text-white">McInnes Design AUTH</h1>
        <CheckSession referrer={referrer} />
      </main>
      <Footer />
    </div>
  );  

}
