"use client";

import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";

// login:
// http://localhost:3000/auth/callback/neto?store_domain=keylime.neto.com.au

// logout:
// https://apps.getneto.com/saml/logout

export default async function AuthNeto(
  props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  }
) {
  const searchParams = await props.searchParams;

  const webstore = searchParams.store_domain ?? "";
  console.log(`## WEBSTORE: ${webstore}`);
  console.log(`PUBLIC URL`)
  console.log(process.env.NEXT_PUBLIC_VERCEL_URL)
  console.log(`VERCEL ENV`)
  console.log(process.env.NEXT_PUBLIC_VERCEL_ENV)
  console.log(process.env.VERCEL_ENV)
  console.log(`LOGGING`)
  console.log(process.env.VERCEL_ENV === "development" || process.env.NODE_ENV === "development" ? "debug" : "warn")

  console.log(`---`)

  if (webstore) {

    /*
    const response = await auth.api.signInWithOAuth2({
      body: {
        providerId: "neto",
        callbackURL: "/account",
        additionalData: { store_domain: webstoreURL },
      },
    });
*/
    

    // console.log(`RESPONSE DATA`)
    // console.log(response)

    await authClient.signIn.oauth2({
      providerId: "neto",
      callbackURL: `${process.env.VERCEL_ENV === "development" || process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://mcinnes.design"}/account`,
      additionalData: { store_domain: webstore },
      fetchOptions: {
        onRequest: async (ctx) => {
            //show loading
            console.log('## LOADING')
            //console.log(ctx)
        },
        onSuccess: async(ctx) => {
            //redirect to the dashboard or sign in page
            console.log('## SUCCESS')
            if (ctx.data?.redirect && ctx.data?.url) {
              redirect(`${ctx.data.url}`);
            }
        },
        onError: async(ctx) => {
            // display the error message
            console.log('## ERROR')
            console.log(ctx)
            throw new Error('Something broke');
        },          
      }
    });

    return (
      <p>Loading...</p>
    );

  }
}
