import Header from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import Back from "@/components/shared/back";

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
            Your account has been removed from the McInnes Design application. 
            If this was a mistake, you can re-authenticate with your platform to 
            restore your connection. Note, some data may still be lost.
          </p>
          <Back />
        </div>
      </main>
      <Footer />
    </div>
  );
}
