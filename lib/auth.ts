import { betterAuth } from "better-auth/minimal";
import { genericOAuth } from "better-auth/plugins"
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { db } from "./database"
import * as schema from "../schema/auth-schema"

export const auth = betterAuth({
  baseURL: {
		allowedHosts: [
			"localhost:3000",
			"mcinnes.design",
			"*.vercel.app",
		],
	},
  protocol: process.env.VERCEL_ENV === "development" || process.env.NODE_ENV === "development" ? "http" : "https",
  database: drizzleAdapter(db, { 
    provider: "pg",
    schema: schema,
  }),
  advanced: {
    // doesn't create cookie in local
    cookiePrefix: "mcinnes-auth",
    // skipStateCookieCheck: process.env.VERCEL_ENV === "development" || process.env.NODE_ENV === "development",
    cookies: {
      state: {
        attributes: {
          // Allows the cookie to be sent on cross-origin redirects
          sameSite: process.env.VERCEL_ENV === "development" || process.env.NODE_ENV === "development" ? "lax" : "none", 
          // Set to false ONLY if your local server does not use HTTPS
          secure: process.env.VERCEL_ENV === "development" || process.env.NODE_ENV === "development", 
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
          //scopes: ["id_token"],
          requireIssuerValidation: true,
          authorizationUrlParams: (ctx) => {
            console.log(`CTX Query`)
            // console.log(ctx)

            console.log(ctx.body.additionalData.store_domain)
            return {
              // Extract a dynamic value from incoming API query parameters
              store_domain: ctx.body.additionalData.store_domain || ""
            };
          }
          // ... other config options
        },
        // Add more providers as needed
      ]
    })
  ]
  //... the rest of your config
});
