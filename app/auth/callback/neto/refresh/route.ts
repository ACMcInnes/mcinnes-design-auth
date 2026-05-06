import bakeCookies from "@/components/auth/bakeCookies";
import encodeJSON from "@/components/auth/encodeJSON";
import getCookie from "@/components/auth/getCookie";
import { accountPayload } from "@/components/types/interfaces";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

let isRefreshing = false;

export async function refreshAccountDetails(account: accountPayload) {
  if (account.oauth.version === 2) {
    if (isRefreshing) {
      return account;
    }

    isRefreshing = true;

    let netoAppURL = "";
    let CLIENT_ID = "";
    let CLIENT_SECRET = "";
    const domain = account.webstore.domain;
    const tokenURL = "/oauth/v2/token?version=2";

    if (
      domain.includes(".uat.neto.net.au") ||
      domain.toString().includes(".uat.mymaropost.net")
    ) {
      // UAT
      netoAppURL = `https://api.uat.netodev.com`;
      CLIENT_ID = `${process.env.UAT_V2_CLIENT_ID}`;
      CLIENT_SECRET = `${process.env.UAT_V2_CLIENT_SECRET}`;
    } else {
      // Production
      // Staging not supported at this time
      netoAppURL = "https://api.netodev.com";
      CLIENT_ID = `${process.env.PROD_V2_CLIENT_ID}`;
      CLIENT_SECRET = `${process.env.PROD_V2_CLIENT_SECRET}`;
    }

    try {
      const response = await fetch(`${netoAppURL}${tokenURL}`, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        method: "POST",
        body: new URLSearchParams({
          client_id: CLIENT_ID as string,
          client_secret: CLIENT_SECRET as string,
          grant_type: "refresh_token",
          refresh_token: account.oauth.refresh_token as string,
        }),
      });

      const newToken = await response.json();

      console.log(`## REFRESH TOKEN RESPONSE`)
      console.log(newToken)

      if (!response.ok) {
        throw new Error(`Token refresh failed with status: ${response.status}`);
      }

      account.oauth.access_token = newToken.access_token;
      account.oauth.refresh_token = newToken.refresh_token; // always update refresh token as it will be rehashed even if it hasn't expired
      account.oauth.scope = newToken.scope;
      delete account.iat;
      delete account.exp;

      const expiresInTimestamp = Date.now() + newToken.expires_in * 1000;
      account.oauth.expires_in = expiresInTimestamp;

      const daysInMonth = new Date(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        0,
      ).getDate();

      // round up days to ensure we are always within the 8 day expiry window
      const daysRemaining = Math.ceil((account.oauth.refresh_expires_in - Date.now()) / 1000 / 60 / 60 / 24);

      console.log(`## REFRESH TOKEN EXPIRES IN ${daysRemaining}`)

      if (daysRemaining < 8) {
        // update refresh token expiry as we have a new token
        account.oauth.refresh_expires_in = new Date().setDate(
          new Date().getDate() + daysInMonth,
        );
      }

      return account;
    } catch (e) {
      console.error(e);
    } finally {
      isRefreshing = false;
    }

    return account;
  } else {
    return account;
  }
}

// If account details were stored in a DB we could run the refresh GET request on a schedule to keep tokens active
// https://vercel.com/docs/cron-jobs

export async function GET(request: NextRequest) {
  const headersList = await headers();
  const referer = headersList.get('referer') ?? '';
  const validReferrers = ['http://localhost:3000', 'https://mcinnes.design'];
  
  console.log(`## ${request.method} | REFRESH TOKEN`);
  console.log(`## REFERRER: ${referer}`)

  const account = await getCookie('mc_design_auth') as accountPayload
  
    if(Object.keys(account).length) {
      console.log(`## ACCOUNT`)
      console.log(account)

      if(account.oauth.version === 2) {
        const currentTimestamp = Date.now();
        console.log(`Expires in ${Math.floor((account.oauth.expires_in - currentTimestamp) / 1000 / 60)}mins`)
        console.log (`need to refresh? ${currentTimestamp >= account.oauth.expires_in}`)

        if(currentTimestamp >= account.oauth.expires_in) {
          // refresh token
          console.log(`## REFRESHING TOKEN`)
          const newAccount = await refreshAccountDetails(account);

          const encodeAuthCookie = await encodeJSON(newAccount);
  
          console.log(`   Encoding TOKEN:`);
          console.log(encodeAuthCookie);
  
          await bakeCookies('v2', encodeAuthCookie);
  
          console.log(`## REDIRECTING TO ACCOUNT...`);
          // this could also be the request referrer

          if(validReferrers.some(ref => referer.startsWith(ref))) {
            console.log(`## BACK TO REFERER...`)
            redirect(referer)
          } else {
            console.log(`## BACK TO ACCOUNT PAGE...`)
            redirect("/account");
          }
          

        } else {
          // token still valid
          console.log(`## RETURNING CURRENT TOKEN`)

          if(validReferrers.some(ref => referer.startsWith(ref))) {
            console.log(`## BACK TO REFERER...`)
            redirect(referer)
          } else {
            console.log(`## BACK TO ACCOUNT PAGE...`)
            redirect("/account");
          }
        }
      }

      return new NextResponse(`## REFRESHED TOKEN`, {
        status: 200,
      });
    }

    return new NextResponse(`## ERROR: No account found`, {
      status: 500,
    });

  
}