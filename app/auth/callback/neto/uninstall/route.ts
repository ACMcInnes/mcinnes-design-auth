
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import deleteCookie from "@/components/auth/deleteCookie";
import crypto from "crypto";

// developer logout, destroy cookie
export async function GET(request: NextRequest) {
  console.log(`## LOGOUT`)
  const eatCookie = await deleteCookie('mc_design_auth')
  
  if(eatCookie) {
    console.log(`   Cookies eaten, yum!`)
    redirect('/logout')
  } else {
    throw new Error('Issue destroying session data, please retry')
  }
}

// OAuth logout, destroy token
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { code, client_id, store_id, api_id } = body;

   console.log(`START UNINSTALL PROCESS...`);

    // Process the webhook payload
    if (api_id) {
      console.log(`## UNINSTALL FULL REQUEST:`);
      console.log(request);

      console.log(`## UNINSTALL BODY:`);
      console.log(body);

      console.log(`Uninstall Code: ${code}`);
      console.log(`Client: ${client_id}`);
      console.log(`Store: ${store_id}`);
      console.log(`Hash: ${api_id}`);

      const headersList = await headers();
      console.log(`## HEADERS:`);
      for (const [key, value] of headersList.entries()) {
        console.log(`${key}: ${value}`);
      }
      const verificationKey = headersList.get("neto_verification_key");
      console.log(`## verification key:`);
      console.log(verificationKey);

      const secret = process.env.BETTER_AUTH_CLIENT_SECRET as string;
      const sharedKey = Buffer.from(secret).toString("base64");

      const expectedVerification = crypto
        .createHmac("sha256", sharedKey)
        .update(JSON.stringify(body))
        .digest("hex");

      console.log(`## expected key:`);
      console.log(expectedVerification);

      if (verificationKey === expectedVerification) {
        if (client_id === process.env.BETTER_AUTH_CLIENT_ID) {
          // uninstall verified, lets just return here for now
          return new NextResponse(`Uninstall successful: ${store_id}`, {
            status: 200,
          });

          // TODO: confirm uninstall request, POST deauth code to Neto Token endpoint

          /*
          const params = new URLSearchParams();

          params.append("client_id", `${CLIENT_ID}`);
          params.append("client_secret", `${CLIENT_SECRET}`);
          params.append("redirect_uri", `${callbackURL}`);
          params.append("grant_type", `authorization_code`);
          params.append("code", `${code}`);

          console.log(`running deauth request...`);

          // hits Internal Server Error on Neto
          // think code or verification key are encoded, need to figure out how to decode

          try {
            const res = await fetch(`${netoAppURL}${tokenURL}`, {
              method: "POST",
              headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods":
                  "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
                //'Content-Type': 'multipart/form-data',
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: params,
            });

            const data = await res.text();
            console.log(`FETCH DEAUTH DATA:`);
            console.log(data);

            return new NextResponse(`Uninstall successful: ${store_id}`, {
              status: 200,
            });
          } catch (e) {
            console.log(e);
            return NextResponse.json({ error: e }, { status: 500 });
          }
            */
        } else {
          return new NextResponse(
            `Uninstall error: Uninstall Client does not match application Client, or wrong Neto environment used.`,
            {
              status: 400,
            }
          );
        }
      } else {
        console.warn(`## ERROR: Verification Key Mismatch!`)
        return new NextResponse(
          `Uninstall error: Could not verify connection, please try again later.`,
          {
            status: 400,
          }
        );
      }
    } else {
      return new NextResponse(`Uninstall error: could not confirm request source`, {
        status: 400,
      });
    }

}
