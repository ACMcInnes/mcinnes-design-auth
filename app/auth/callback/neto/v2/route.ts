import { NextResponse, NextRequest } from "next/server";
import { redirect } from "next/navigation";
import { headers, cookies } from "next/headers";
import crypto from "crypto";

import jwt, { JwtPayload } from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import encodeJSON from "@/components/auth/encodeJSON";
import { getToken } from "@/components/auth/getToken";

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

interface oauthPayload {
  scope: string;
  api_id: string;
  id_token: string;
  token_type: string;
  expires_in: number;
  access_token: string;
  refresh_token: string;
}

interface oauthResponse {
  oauth: oauthPayload;
  webstore: webstoreResponse;
  user: userResponse;
  activeProductTotal: string;
}

interface webstoreResponse {
  domain: string;
  business_name: string;
  timezone: string;
  country: string;
  hash: string;
}

interface userResponse {
  uid: string;
  preferred_username: string;
  email: string;
}

let OAuthResponse = {} as oauthResponse;

async function setCookie(name: string, data: any) {
  const cookieJar = await cookies();
  console.log(`creating cookie: ${name}`);
  if (
    process.env.VERCEL_ENV === "development" ||
    process.env.NODE_ENV === "development"
  ) {
    console.log(`creating lax cookie`);
    cookieJar.set(name, data, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
    });
  } else {
    console.log(`creating secure cookie`);
    cookieJar.set(name, data, {
      httpOnly: true,
      sameSite: "strict",
      secure: true,
      path: "/",
    });
  }

  console.log(`creating cookie: ${name}`);
  console.log(`cookie created: ${cookieJar.has(name)}`);
  console.log(cookieJar.get(name));
}

async function getWebstoreProducts(netoAppURL: string, data: oauthPayload) {
  console.log(`FETCHING PRODUCT DATA`);
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

    console.log(`GET WEBSTORE PRODUCT RESPONSE:`);
    console.log(`${res.status} - ${res.statusText}`);

    if (!res.ok || res.status !== 200) {
      console.log(`issue with API call`);
      console.log(res);

      if (res.statusText === "Unauthorized") {
        console.log(`user is not authorized to make this request`);
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

async function getWebstoreProperties(netoAppURL: string, data: oauthPayload) {
  console.log(`FETCHING PRODUCT DATA`);
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

    console.log(`GET WEBSTORE PROPERTIES RESPONSE:`);
    console.log(`${res.status} - ${res.statusText}`);

    if (!res.ok || res.status !== 200) {
      console.log(`issue with API call`);
      console.log(res);

      if (res.statusText === "Unauthorized") {
        console.log(`user is not authorized to make this request`);
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
  const { code, grantType, netoEnvironment, client_id, store_id, api_id } =
    body;

  console.log(`POST REQUEST RECEIVED`);
  console.log(`request method: ${request.method}`);
  // const requestURL=`${tokenURL}&client_id=${CLIENT_ID}&client_secret=${SECRET}&redirect_uri=${localRedirectURL}&grant_type=authorization_code&code=${code}`
  console.log(`Node: ${process.env.NODE_ENV}`);
  console.log(`Vercel: ${process.env.VERCEL_ENV}`);

  if (
    process.env.VERCEL_ENV === "development" ||
    process.env.NODE_ENV === "development"
  ) {
    callbackURL = `http://localhost:3000${redirectURL}?environment=${netoEnvironment}`;
  } else {
    callbackURL = `https://mcinnes-design-auth.vercel.app${redirectURL}?environment=${netoEnvironment}`;
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
    console.log(`TOKEN REQUEST`);

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

    console.log(`SWAPPING CODE FOR TOKEN`);

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
          console.log(`CHECKING ID JWT`);
          if (err) return NextResponse.json({ error: err }, { status: 500 });

          // console.log(decoded)
        });

      accessToken &&
        jwt.verify(accessToken, signingKey, {}, function (err, decoded) {
          console.log(`CHECKING ACCESS JWT`);
          if (err) return NextResponse.json({ error: err }, { status: 500 });

          console.log(`ACCESS JWT LOOKS GOOD...`);

          let jwtContents = decoded as JwtPayload;
          let userFormatted = {} as userResponse;
          userFormatted.uid = jwtContents.uid;
          userFormatted.preferred_username = jwtContents.preferred_username;
          userFormatted.email = jwtContents.email;

          console.log(`FORMATTING USER DETAILS...`);

          OAuthResponse.user = userFormatted;

          console.log(`STORING USER DETAILS...`);
        });

      // if we are here, we have a valid JWT and Access Token
      // run API call here to confirm connection
      console.log(`VALID JWT`);

      const properties = await getWebstoreProperties(netoAppURL, data);

      let webstoreFormatted = {} as webstoreResponse;
      webstoreFormatted.business_name = properties.result.business_name;
      webstoreFormatted.domain = properties.result.domain;
      webstoreFormatted.timezone = properties.result.timezone;
      webstoreFormatted.country = properties.result.country;
      webstoreFormatted.hash = data.api_id;

      OAuthResponse.webstore = webstoreFormatted;

      const products = await getWebstoreProducts(netoAppURL, data);

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
    console.log(`UNINSTALL REQUEST`);

    // Process the webhook payload
    if (api_id) {
      console.log(`UNINSTALL TEXT:`);
      console.log(request);

      console.log(`Uninstall Code: ${code}`);
      console.log(`Client: ${client_id}`);
      console.log(`Store: ${store_id}`);
      console.log(`Hash: ${api_id}`);

      const headersList = await headers();
      console.log(`headers:`);
      console.log(headersList);
      const verification_key = headersList.get("neto_verification_key");
      console.log(`verification key: ${verification_key}`);

      // confirm uninstall request, POST deauth code to Neto Token endpoint

      if (client_id === CLIENT_ID) {
        const params = new URLSearchParams();

        params.append("client_id", `${CLIENT_ID}`);
        params.append("client_secret", `${CLIENT_SECRET}`);
        params.append("redirect_uri", `${callbackURL}`);
        params.append("grant_type", `authorization_code`);
        params.append("code", `${code}`);

        console.log(`running deauth request...`);

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
      } else {
        return new NextResponse(
          `Uninstall error: Uninstall Client does not match application Client, or wrong Neto environment used.`,
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
    callbackURL = `https://mcinnes-design-auth.vercel.app${redirectURL}?environment=${netoEnvironment}`;
  }

  if (hasWebstore) {
    const webstoreURL = searchParams.get("store_domain");
    // console.log(`store_domain: ${webstoreURL}`);
    // console.log(`NETO APP CODE URL`)
    // console.log(`${netoAppURL}${codeURL}&client_id=${CLIENT_ID}&redirect_uri=${callbackURL}&response_type=code id_token&scope=openid&store_domain=${webstoreURL}&state=${initialState}`)
    redirect(
      `${netoAppURL}${codeURL}&client_id=${CLIENT_ID}&redirect_uri=${callbackURL}&response_type=code id_token&scope=openid&store_domain=${webstoreURL}&state=${initialState}`
    );
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

      console.log(`TOKEN RESPONSE`);
      console.log(oauthRes.status);

      if (oauthRes.status === 201) {
        const encodeAuthCookie = await encodeJSON(OAuthResponse);

        console.log(`ENCODED:`);
        console.log(encodeAuthCookie);

        const size = 3000; // maximum size of each chunk
        const regex = new RegExp(".{1," + size + "}", "g");
        const tokenChunks = encodeAuthCookie.match(regex);

        // refine this into a function call to reduce duplicate code
        const cookieJar = await cookies();

        console.log(`storing oauth details...`);
        if (tokenChunks) {
          tokenChunks.forEach((tokenChunk, index) => {
            console.log(`creating cookie: mc_design_auth.${index}`);
            if (
              process.env.VERCEL_ENV === "development" ||
              process.env.NODE_ENV === "development"
            ) {
              console.log(`creating lax cookie`);
              cookieJar.set(`mc_design_auth.${index}`, tokenChunk, {
                httpOnly: true,
                sameSite: "lax",
                secure: false,
                path: "/",
              });
            } else {
              console.log(`creating secure cookie`);
              cookieJar.set(`mc_design_auth.${index}`, tokenChunk, {
                httpOnly: true,
                sameSite: "strict",
                secure: true,
                path: "/",
              });
            }

            console.log(`creating cookie: mc_design_auth.${index}`);
            console.log(
              `cookie created: ${cookieJar.has(`mc_design_auth.${index}`)}`
            );
            // console.log(cookieJar.get(`mc_design_auth.${index}`))

            console.log(`created cookie: mc_design_auth.${index}`);
          });
        } else {
          console.log(`creating cookie: mc_design_auth`);
          if (
            process.env.VERCEL_ENV === "development" ||
            process.env.NODE_ENV === "development"
          ) {
            console.log(`creating lax cookie`);
            cookieJar.set(`mc_design_auth`, JSON.stringify(encodeAuthCookie), {
              httpOnly: true,
              sameSite: "lax",
              secure: false,
              path: "/",
            });
          } else {
            console.log(`creating secure cookie`);
            cookieJar.set(`mc_design_auth`, JSON.stringify(encodeAuthCookie), {
              httpOnly: true,
              sameSite: "strict",
              secure: true,
              path: "/",
            });
          }

          console.log(`creating cookie: mc_design_auth`);
          console.log(`cookie created: ${cookieJar.has(`mc_design_auth}`)}`);
          // console.log(cookieJar.get(`mc_design_auth`))

          console.log(`created cookie: mc_design_auth`);
        }

        console.log(`oauth complete, redirecting...`);
        // return NextResponse.json({ OAuthResponse }, { status: 201 });
        redirect("/account");
      } else {
        console.log(`oauth error`);
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

    console.log(`oauth error:`);
    console.log(`description: ${errorDesc}`);
    console.log(`hint: ${errorHint}`);
    console.log(`message: ${errorMessage}`);
    return NextResponse.json(
      { oauth: "error - oauth connection failed" },
      { status: 500 }
    );
  } else {
    console.log(`oauth error`);
    return NextResponse.json(
      { oauth: "error - missing query parameter" },
      { status: 500 }
    );
  }
}
