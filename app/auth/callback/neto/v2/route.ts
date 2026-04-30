import { NextResponse, NextRequest } from "next/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import crypto from "crypto";

import jwt, { JwtPayload } from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import encodeJSON from "@/components/auth/encodeJSON";
import { getToken } from "@/components/auth/getToken";
import { oauthV2Payload, oauthResponse, webstoreResponse, userResponse } from "@/components/types/interfaces";
import bakeCookies from "@/components/auth/bakeCookies";

// v2 Neto API OAuth

let netoAppURL = "";
let callbackURL = "";
let netoEnvironment = "";
let publicKeyURL = "";
let CLIENT_ID = "";
let CLIENT_SECRET = "";

const redirectURL = "/auth/callback/neto/v2";
const codeURL = "/oauth/v2/auth?version=2";
const tokenURL = "/oauth/v2/token?version=2";
const initialState = crypto.randomBytes(16).toString("hex");

const API_ENDPOINT_V2 = "/v2/stores/";

let OAuthResponse = {} as oauthResponse;

async function getWebstoreProducts(netoAppURL: string, data: oauthV2Payload) {
  console.log(`## FETCHING PRODUCT DATA`);
  let webstoreProductsResponse;

  try {
    const res = await fetch(
      `${netoAppURL}${API_ENDPOINT_V2}${data.api_id}/products`,
      {
        method: "GET",
        headers: {
          Authorization: `${data.token_type} ${data.access_token}`,
          "Content-Type": "application/json",
        },
        // body: `{}`,
      }
    );

    console.log(`   GET products:`);
    console.log(`   ${res.status} - ${res.statusText}`);

    if (!res.ok || res.status !== 200) {
      console.log(`   !! issue with API call !!`);
      console.log(res);

      if (res.statusText === "Unauthorized") {
        console.log(`   !! user is not authorized to make this request !!`);
      } else {
        // This will activate the closest `error.js` Error Boundary
        throw new Error(`Failed to fetch data: ${res.statusText}`);
      }
    }

    webstoreProductsResponse = await res.json();
    // console.log(`WEBSTORE PRODUCTS:`);
    // console.log(webstoreProductsResponse);
    // console.log(`API MESSAGES: ${webstoreProductsResponse.Messages}`);
  } catch (e) {
    return `Could not get webstore products. ${e}`;
  }
  return webstoreProductsResponse;
}

async function getWebstoreProperties(netoAppURL: string, data: oauthV2Payload) {
  console.log(`## FETCHING WEBSTORE DATA`);
  let webstorePropertiesResponse;

  try {
    const res = await fetch(
      `${netoAppURL}${API_ENDPOINT_V2}${data.api_id}/properties`,
      {
        method: "GET",
        headers: {
          Authorization: `${data.token_type} ${data.access_token}`,
          "Content-Type": "application/json",
        },
        // body: `{}`,
      }
    );

    console.log(`   GET webstore:`);
    console.log(`   ${res.status} - ${res.statusText}`);

    if (!res.ok || res.status !== 200) {
      console.log(`   !! issue with API call !!`);
      console.log(res);

      if (res.statusText === "Unauthorized") {
        console.log(`   !! user is not authorized to make this request !!`);
      } else {
        // This will activate the closest `error.js` Error Boundary
        throw new Error(`Failed to fetch data: ${res.statusText}`);
      }
    }

    webstorePropertiesResponse = await res.json();
    // console.log(`WEBSTORE PROPERTIES:`);
    // console.log(webstorePropertiesResponse);
    // console.log(`API MESSAGES: ${webstorePropertiesResponse.Messages}`);
  } catch (e) {
    return `Could not get webstore properties. ${e}`;
  }
  return webstorePropertiesResponse;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { code, grantType, netoEnvironment, client_id, store_id, api_id } = body;

  console.log(`## ${request.method} REQUEST RECEIVED`);
  // const requestURL=`${tokenURL}&client_id=${CLIENT_ID}&client_secret=${SECRET}&redirect_uri=${localRedirectURL}&grant_type=authorization_code&code=${code}`
  console.log(`   Node: ${process.env.NODE_ENV}`);
  console.log(`   Vercel: ${process.env.VERCEL_ENV}`);

  if (
    process.env.VERCEL_ENV === "development" ||
    process.env.NODE_ENV === "development"
  ) {
    callbackURL = `http://localhost:3000${redirectURL}?environment=${
      netoEnvironment ? netoEnvironment : "production"
    }`;
  } else {
    callbackURL = `https://auth.mcinnes.design${redirectURL}?environment=${
      netoEnvironment ? netoEnvironment : "production"
    }`;
  }

  if (netoEnvironment === "uat" || netoEnvironment === "staging") {
    // staging not supported at this time
    netoAppURL = `https://api.${netoEnvironment}.netodev.com`;
    CLIENT_ID = `${process.env.UAT_V2_CLIENT_ID}`;
    CLIENT_SECRET = `${process.env.UAT_V2_CLIENT_SECRET}`;
    publicKeyURL = `https://api.${netoEnvironment}.netodev.com/.well-known/jwks.json`;
  } else {
    netoAppURL = "https://api.netodev.com";
    CLIENT_ID = `${process.env.PROD_V2_CLIENT_ID}`;
    CLIENT_SECRET = `${process.env.PROD_V2_CLIENT_SECRET}`;
    publicKeyURL = `https://api.netodev.com/.well-known/jwks.json`;
  }

  if (grantType) {
    console.log(`## GENERATING TOKEN`);

    const params = new URLSearchParams();

    params.append("client_id", `${CLIENT_ID}`);
    params.append("client_secret", `${CLIENT_SECRET}`);
    params.append("redirect_uri", `${callbackURL}`);
    params.append("grant_type", `${grantType}`);
    if (grantType === "authorization_code") {
      params.append("code", `${code}`);
    } else {
      params.append("refresh_token", `${code}`);
    }

    console.log(`   Swapping CODE for TOKEN`);

    try {
      const res = await fetch(`${netoAppURL}${tokenURL}`, {
        method: "POST",
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          //'Content-Type': 'multipart/form-data',
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      });

      const data = await res.json();
      // console.log(`OAUTH TOKEN RESPONSE:`);
      // console.log(data);
      OAuthResponse.oauth = data;
      const accessToken = data.access_token;
      const idToken = data.id_token;

      console.log(`   Checking for valid TOKEN`);

      const client = jwksClient({
        jwksUri: publicKeyURL,
      });

      // console.log(`CLIENT`)
      // console.log(client)

      const kid = "public:app-portal@neto";
      const key = await client.getSigningKey(kid);
      const signingKey = key.getPublicKey();

      // console.log(`PUBLIC KEY`)
      // console.log(signingKey)

      idToken &&
        jwt.verify(idToken, signingKey, {}, function (err, decoded) {
          console.log(`   Checking ID JWT...`);
          if (err) return NextResponse.json({ error: err }, { status: 500 });

          // console.log(decoded)
        });

      accessToken &&
        jwt.verify(accessToken, signingKey, {}, function (err, decoded) {
          console.log(`   Checking Access JWT...`);
          if (err) return NextResponse.json({ error: err }, { status: 500 });

          console.log(`   JWT is valid`);

          let jwtContents = decoded as JwtPayload;
          let userFormatted = {} as userResponse;
          userFormatted.uid = jwtContents.uid;
          userFormatted.preferred_username = jwtContents.preferred_username;
          userFormatted.email = jwtContents.email;

          console.log(`   Checking user details...`);

          OAuthResponse.user = userFormatted;

          console.log(`   Storing user details...`);
        });

      // if we are here, we have a valid JWT and Access Token
      // run API call here to confirm connection
      console.log(`   Valid JWT and Access Token`);

      const [properties, products] = await Promise.all([
        getWebstoreProperties(netoAppURL, data),
        getWebstoreProducts(netoAppURL, data),
      ]);

      let webstoreFormatted = {} as webstoreResponse;
      webstoreFormatted.business_name = properties.result.business_name;
      webstoreFormatted.domain = properties.result.domain;
      webstoreFormatted.timezone = properties.result.timezone;
      webstoreFormatted.country = properties.result.country;
      webstoreFormatted.hash = data.api_id;

      OAuthResponse.webstore = webstoreFormatted;

      OAuthResponse.activeProductTotal = products.result_info.total_count;

      // console.log(`OAUTH RESPONSE:`);
      // console.log(OAuthResponse);
      return NextResponse.json(
        { oauth: "success - oauth connection created" },
        { status: 201 }
      );
    } catch (e) {
      return NextResponse.json({ error: e }, { status: 500 });
    }
  } else {
    // request.method === POST
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

      const sharedKey = Buffer.from(CLIENT_SECRET).toString("base64");

      console.log(`## shared key:`);
      console.log(sharedKey);

      const expectedVerification = crypto
        .createHmac("sha256", sharedKey)
        .update(JSON.stringify(body))
        .digest("hex");

      console.log(`## expected key:`);
      console.log(expectedVerification);

      if (verificationKey === expectedVerification) {
        if (client_id === CLIENT_ID) {
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
      return new NextResponse(`Uninstall error: no request body`, {
        status: 400,
      });
    }
  }
}

// login:
// http://localhost:3000/auth/callback/neto/v2?store_domain=keylime.neto.com.au&environment=production

// logout:
// https://apps.getneto.com/saml/logout

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const hasWebstore = searchParams.has("store_domain");
  const hasCode = searchParams.has("code");
  const hasError = searchParams.has("error");
  const hasNetoEnvironment = searchParams.has("environment");

  console.log(`## ${request.method} REQUEST RECEIVED`);

  if (hasNetoEnvironment) {
    netoEnvironment = searchParams.get("environment") ?? "production";
    if (netoEnvironment === "uat" || netoEnvironment === "staging") {
      // staging not supported at this time
      netoAppURL = `https://api.${netoEnvironment}.netodev.com`;
      CLIENT_ID = `${process.env.UAT_V2_CLIENT_ID}`;
      CLIENT_SECRET = `${process.env.UAT_V2_CLIENT_SECRET}`;
    } else {
      netoAppURL = "https://api.netodev.com";
      CLIENT_ID = `${process.env.PROD_V2_CLIENT_ID}`;
      CLIENT_SECRET = `${process.env.PROD_V2_CLIENT_SECRET}`;
    }
  } else {
    // fallback to production
    netoEnvironment = "production";
    netoAppURL = "https://api.netodev.com";
    CLIENT_ID = `${process.env.PROD_V2_CLIENT_ID}`;
    CLIENT_SECRET = `${process.env.PROD_V2_CLIENT_SECRET}`;
  }

  if (process.env.NODE_ENV === "development") {
    callbackURL = `http://localhost:3000${redirectURL}?environment=${netoEnvironment}`;
    // e.g: http://localhost:3000/auth/callback/neto/v2?environment=uat
  } else {
    callbackURL = `https://auth.mcinnes.design${redirectURL}?environment=${netoEnvironment}`;
  }

  if (hasWebstore) {
    const webstoreURL = searchParams.get("store_domain");
    // console.log(`store_domain: ${webstoreURL}`);
    // console.log(`NETO APP CODE URL`)
    // console.log(`${netoAppURL}${codeURL}&client_id=${CLIENT_ID}&redirect_uri=${callbackURL}&response_type=code id_token&scope=openid&store_domain=${webstoreURL}&state=${initialState}`)
    
    console.log(`## CODE REQUEST`)
    return NextResponse.redirect(new URL(`${netoAppURL}${codeURL}&client_id=${CLIENT_ID}&redirect_uri=${callbackURL}&response_type=code id_token&scope=openid&store_domain=${webstoreURL}&state=${initialState}`));

  } else if (hasCode) {
    const code = searchParams.get("code") ?? "";
    const state = searchParams.get("state") ?? "";
    // console.log(`code: ${code}`);
    // return NextResponse.json({ OAuthResponse: `${code}` }, { status: 201 });

    if (state !== initialState) {
      console.log(`oauth error`);
      return NextResponse.json(
        {
          oauth:
            "error - oauth connection failed, state is incorrect or has been modified",
        },
        { status: 500 }
      );
    } else {
      const oauthRes = await getToken("/auth/callback/neto/v2", {
        code: code,
        grantType: "authorization_code",
        netoEnvironment: netoEnvironment,
      });

      console.log(`## TOKEN RESPONSE`);
      console.log(oauthRes.status);

      if (oauthRes.status === 201) {

        if(netoEnvironment === "uat") {
          console.log(OAuthResponse)
        }
        
        const encodeAuthCookie = await encodeJSON(OAuthResponse);

        console.log(`   Encoding TOKEN:`);
        console.log(encodeAuthCookie);

        await bakeCookies('v2', encodeAuthCookie);

        console.log(`## Redirecting to Account Page...`);
        // return NextResponse.json({ OAuthResponse }, { status: 201 });
        redirect("/account");
      } else {
        console.log(`## OAuth error`);
        return NextResponse.json(
          { oauth: "error - oauth connection failed" },
          { status: 500 }
        );
      }
    }
  } else if (hasError) {
    const errorDesc = searchParams.get("error_description") ?? "";
    const errorHint = searchParams.get("hint") ?? "";
    const errorMessage = searchParams.get("message") ?? "";

    console.log(`## OAuth error:`);
    console.log(`   description: ${errorDesc}`);
    console.log(`   hint: ${errorHint}`);
    console.log(`   message: ${errorMessage}`);
    return NextResponse.json(
      { oauth: "error - oauth connection failed" },
      { status: 500 }
    );
  } else {
    console.log(`## OAuth error`);
    return NextResponse.json(
      { oauth: "error - missing query parameter" },
      { status: 500 }
    );
  }
}
