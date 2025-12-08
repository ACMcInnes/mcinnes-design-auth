import { NextResponse, NextRequest } from "next/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import crypto from "crypto";

// v1 Neto API OAuth

let netoAppURL = "";
let callbackURL = "";
let netoEnvironment = "";
let CLIENT_ID = "";
let CLIENT_SECRET = "";

const redirectURL = "/auth/callback/neto/v1";
const codeURL = "/oauth/v2/auth";
const tokenURL = "/oauth/v2/token";
const initialState = crypto.randomBytes(16).toString("hex");

const API_ENDPOINT_V1 = "/do/WS/NetoAPI";

const MAX_LIMIT = 10000;

interface oauthPayload {
  scope: string;
  store_id: string;
  store_domain: string;
  store_name: number;
  store_timezone: string;
  access_token: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  billing_address: {
    street1: string;
    street2: string;
    city: string;
    post_code: string;
    state: string;
    country_name: string;
    country_code: string;
  };
}

interface oauthResponse {
  oauth: oauthPayload;
  webstore: object;
  activeProductTotal: string;
}

interface webstoreResponse {
  domain: string;
  business: string;
  timezone: string;
  country: string;
}

let OAuthResponse = {} as oauthResponse;

async function getProductTotal(clientID: string, data: oauthPayload) {
  let webstoreProducts;

  try {
    const res = await fetch(`https://${data.store_domain}${API_ENDPOINT_V1}`, {
      method: "POST",
      headers: {
        NETOAPI_ACTION: "GetItem",
        X_ACCESS_KEY: clientID,
        X_SECRET_KEY: data.access_token,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: `{
            "Filter": {
                "Approved": [
                    "True"
                ],
                "Visible": [
                    "True"
                ],
                "ParentSKU": "",
                "Limit": "${MAX_LIMIT}"
            }
        }`,
    });

    console.log(`GET PRODUCT TOTAL RESPONSE:`);
    console.log(`${res.status} - ${res.statusText}`);

    if (!res.ok || res.status !== 200) {
      console.log(`issue with API call`);

      if (res.statusText === "Unauthorized") {
        console.log(`user is not authorized to make this request`);
      } else {
        // This will activate the closest `error.js` Error Boundary
        throw new Error(`Failed to fetch data: ${res.statusText}`);
      }
    }

    webstoreProducts = await res.json();
    console.log(`WEBSTORE PRODUCTS:`);
    console.log(webstoreProducts);
    console.log(`API MESSAGES: ${webstoreProducts.Messages}`);
  } catch (e) {
    return `Could not get webstore products. ${e}`;
  }
  const totalProducts = webstoreProducts.Item.length;
  return totalProducts;
}

export async function POST(
  request: NextRequest,
  code: String,
  grantType: String,
  netoEnvironment: String
) {
  console.log(`POST REQUEST RECEIVED`);
  console.log(`request method: ${request.method}`);
  // const requestURL=`${tokenURL}&client_id=${CLIENT_ID}&client_secret=${SECRET}&redirect_uri=${localRedirectURL}&grant_type=authorization_code&code=${code}`
  console.log(`Node: ${process.env.NODE_ENV}`);
  console.log(`Vercel: ${process.env.VERCEL_ENV}`)

  if (process.env.VERCEL_ENV === "development" || process.env.NODE_ENV === "development") {
    callbackURL = `http://localhost:3000${redirectURL}?environment=${netoEnvironment}`;
  } else {
    callbackURL = `https://mcinnes-design-auth.vercel.app${redirectURL}?environment=${netoEnvironment}`;
  }

  if (netoEnvironment === "uat" || netoEnvironment === "staging") {
    // staging not supported at this time
    netoAppURL = `https://apps.${netoEnvironment}.getneto.com`;
    CLIENT_ID = `${process.env.UAT_V1_CLIENT_ID}`;
    CLIENT_SECRET = `${process.env.UAT_V1_CLIENT_SECRET}`;
  } else {
    netoAppURL = "https://apps.getneto.com";
    CLIENT_ID = `${process.env.PROD_V1_CLIENT_ID}`;
    CLIENT_SECRET = `${process.env.PROD_V1_CLIENT_SECRET}`;
  }

  if (request.method === "GET") {
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
      console.log(`OAUTH TOKEN RESPONSE:`);
      console.log(data);
      OAuthResponse.oauth = data;
      const accessToken = data.access_token;

      if (accessToken) {
        // run API call here to confirm connection

        let webstoreFormatted = {} as webstoreResponse;
        webstoreFormatted.business = data.store_name;
        webstoreFormatted.domain = data.store_domain;
        webstoreFormatted.timezone = data.store_timezone;
        webstoreFormatted.country = data.billing_address.country_name;

        OAuthResponse.webstore = webstoreFormatted;

        const productTotal = await getProductTotal(CLIENT_ID, data);

        OAuthResponse.activeProductTotal = productTotal;

        console.log(`OAUTH RESPONSE:`);
        console.log(OAuthResponse);

        return NextResponse.json(
          { oauth: "success - oauth connection created" },
          { status: 201 }
        );
      } else {
        return NextResponse.json(
          { oauth: "error - oauth connection failed" },
          { status: 500 }
        );
      }
    } catch (e) {
      return NextResponse.json({ error: e }, { status: 500 });
    }
  } else {
    // request.method === POST
    console.log(`UNINSTALL REQUEST`);

    try {
      // Process the webhook payload
      const text = await request.json();
      if (text) {
        console.log(`UNINSTALL TEXT:`);
        console.log(text);

        console.log(`Uninstall Code: ${text.code}`);
        console.log(`Client: ${text.client_id}`);
        console.log(`Store: ${text.store_id}`);
        console.log(`Hash: ${text.api_id}`);

        const headersList = await headers();
        console.log(`headers:`);
        console.log(headersList);
        const verification_key = headersList.get("neto_verification_key");
        console.log(`verification key: ${verification_key}`);

        // confirm uninstall request, POST deauth code to Neto Token endpoint

        if (text.client_id === CLIENT_ID) {
          const params = new URLSearchParams();

          params.append("client_id", `${CLIENT_ID}`);
          params.append("client_secret", `${CLIENT_SECRET}`);
          params.append("redirect_uri", `${callbackURL}`);
          params.append("grant_type", `authorization_code`);
          params.append("code", `${text.code}`);

          console.log(`running deauth request...`);

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

            return new NextResponse(`Uninstall successful: ${text.store_id}`, {
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
    } catch (error) {
      // issue receiving uninstall request
      return new NextResponse(`Uninstall error: ${error}`, {
        status: 400,
      });
    }
  }
}

// login:
// http://localhost:3000/auth/callback/neto/v1?store_domain=keylime.neto.com.au&environment=production

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
      netoAppURL = `https://apps.${netoEnvironment}.getneto.com`;
      CLIENT_ID = `${process.env.UAT_V1_CLIENT_ID}`;
      CLIENT_SECRET = `${process.env.UAT_V1_CLIENT_SECRET}`;
    } else {
      netoAppURL = "https://apps.getneto.com";
      CLIENT_ID = `${process.env.PROD_V1_CLIENT_ID}`;
      CLIENT_SECRET = `${process.env.PROD_V1_CLIENT_SECRET}`;
    }
  } else {
    // fallback to production
    netoEnvironment = "production";
    netoAppURL = "https://apps.getneto.com";
    CLIENT_ID = `${process.env.PROD_V1_CLIENT_ID}`;
    CLIENT_SECRET = `${process.env.PROD_V1_CLIENT_SECRET}`;
  }

  console.log(process.env.NODE_ENV);

  if (process.env.NODE_ENV === "development") {
    callbackURL = `http://localhost:3000${redirectURL}?environment=${netoEnvironment}`;
    // e.g: http://localhost:3000//auth/callback/neto/v1?environment=uat
  } else {
    callbackURL = `https://mcinnes-design-auth.vercel.app${redirectURL}?environment=${netoEnvironment}`;
  }

  if (hasWebstore) {
    const webstoreURL = searchParams.get("store_domain");
    // console.log(`store_domain: ${webstoreURL}`);
    redirect(
      `${netoAppURL}${codeURL}?client_id=${CLIENT_ID}&redirect_uri=${callbackURL}&response_type=code&store_domain=${webstoreURL}&state=${initialState}`
    );
  } else if (hasCode) {
    const code = searchParams.get("code") ?? "";
    const state = searchParams.get("state") ?? "";
    // console.log(`code: ${code}`);
    // return NextResponse.json({ OAuthResponse: `${code}` }, { status: 201 });

    if (state !== initialState) {
      console.log(`oauth error`);
      return NextResponse.json(
        { oauth: "error - oauth connection failed, state is incorrect or has been modified" },
        { status: 500 }
      );
    } else {
      const oauthRes = await POST(
        request,
        code,
        "authorization_code",
        netoEnvironment
      );

      console.log(`TOKEN RESPONSE`);
      console.log(oauthRes);

      if (oauthRes?.status === 201) {
        console.log(`oauth complete`);
        return NextResponse.json({ OAuthResponse }, { status: 201 });
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
