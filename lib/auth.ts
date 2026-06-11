import { betterAuth } from "better-auth/minimal";
import { genericOAuth } from "better-auth/plugins";
import { oAuthProxy } from "better-auth/plugins";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { db } from "./database";
import * as schema from "../schema/auth-schema";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || `https://${process.env.VERCEL_URL}` || `http://localhost:3000`,
  trustedOrigins: [
    `https://*vercel.app`,
    `https://mcinnes.design`,
    `http://localhost:3000`
  ],
  /*
  baseURL: {
		allowedHosts: [
			"localhost:3000",
			"mcinnes.design",
			"*.vercel.app",
		],
	},
  protocol: process.env.VERCEL_ENV === "development" || process.env.NODE_ENV === "development" ? "http" : "https",
  */
  database: drizzleAdapter(db, { 
    provider: "pg",
    schema: schema,
  }),
  advanced: {
    // doesn't create cookie in local
    cookiePrefix: "mcinnes-auth",
    cookies: {
      state: {
        attributes: {
          sameSite: "none", 
          secure: true, 
        }
      }
    }
  },
  logger: {
		level: process.env.VERCEL_ENV === "development" || process.env.NODE_ENV === "development" ? "debug" : "warn", 
	},
  plugins: [
    genericOAuth({
      config: [
        {
          providerId: "neto",
          clientId: process.env.BETTER_AUTH_CLIENT_ID as string,
          clientSecret: process.env.BETTER_AUTH_CLIENT_SECRET as string,
          discoveryUrl: "https://api.netodev.com/.well-known/openid-configuration",
          authorizationUrl: "https://api.netodev.com/oauth/v2/auth",
          tokenUrl: "https://api.netodev.com/oauth/v2/token",
          requireIssuerValidation: true,
          authorizationUrlParams: (ctx) => {
            console.log(`AUTH URL PARAMS`)
            // console.log(ctx)

            console.log(ctx.body.additionalData.store_domain)
            return {
              // Extract a dynamic value from incoming API query parameters
              store_domain: ctx.body.additionalData.store_domain || ""
            };
          },
          getUserInfo: async (tokens) => {
            // Access provider-specific fields from raw token data
            console.log(`TOKENS`)
            console.log(tokens)
           const userId = tokens.raw?.user_id as string;

           /*
                const url = `https://api.netodev.com/v2/stores/${tokens.api_id}/users?username=${tokens.username}`
                const profile = await fetch(url, {
                    headers: {
                    Authorization: `Bearer ${tokens.access_token}`,
                    "Content-Type": "application/json",
                    },
                }).then(async (res) => await res.json())
            */

                
            const response = await fetch(
              `https://provider.example.com/api/user?` +
              `access_token=${tokens.accessToken}`
            );
            const data = await response.json();
            
            return {
              id: userId,
              name: data.display_name,
              email: data.email,
              image: data.avatar_url,
              emailVerified: data.email_verified,
            };
          },
          // ... other config options
        },
        // Add more providers as needed
      ]
    }),
    oAuthProxy({ 
      productionURL: process.env.BETTER_AUTH_URL, 
      secret: process.env.OAUTH_PROXY_SECRET, 
    }),
    nextCookies()
  ]
  //... the rest of your config
});
