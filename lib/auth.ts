import { betterAuth } from "better-auth/minimal";
import { genericOAuth } from "better-auth/plugins";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { db } from "./database";
import * as schema from "../schema/auth-schema";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

function calculateNetoRefreshExpiry(): Date {
  const now = new Date();

  const daysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0
  ).getDate();

  return new Date(now.getTime() + daysInMonth * 24 * 60 * 60 * 1000);
}

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  advanced: {
    cookiePrefix: "mcinnes-auth",
    crossSubDomainCookies: {
      enabled: process.env.VERCEL_ENV === "production",
      domain: "neto.mcinnes.design",
    },
  },
  trustedOrigins: ["http://localhost:3000", "https://mcinnes.design"],
  logger: {
    level:
      process.env.VERCEL_ENV === "development" ||
      process.env.NODE_ENV === "development"
        ? "debug"
        : "warn",
  },
  plugins: [
    genericOAuth({
      config: [
        {
          providerId: "neto",
          issuer: "https://api.netodev.com",
          clientId: process.env.BETTER_AUTH_CLIENT_ID as string,
          clientSecret: process.env.BETTER_AUTH_CLIENT_SECRET as string,
          authorizationUrl: "https://api.netodev.com/oauth/v2/auth?version=2",
          tokenUrl: "https://api.netodev.com/oauth/v2/token?version=2",
          requireIssuerValidation: false,
          pkce: false,
          responseType: "code id_token",
          scopes: [ "openid", "profile", "email" ],
          authorizationUrlParams: (ctx) => ({
            store_domain: ctx.body.additionalData.store_domain || "",
          }),
          getUserInfo: async (tokens) => {
            const idToken = tokens.idToken;
            if (!idToken) {
              throw new Error("Missing id_token from Neto");
            }

            const publicKeyURL = `https://api.netodev.com/.well-known/jwks.json`;
            const client = jwksClient({
              jwksUri: publicKeyURL,
            });

            const kid = "public:app-portal@neto";
            const key = await client.getSigningKey(kid);
            const signingKey = key.getPublicKey();

            const decoded = await new Promise<any>((resolve, reject) => {
              jwt.verify(
                idToken,
                signingKey,
                {
                  issuer: "https://api.netodev.com",
                  audience: process.env.BETTER_AUTH_CLIENT_ID,
                },
                (err, decoded) => {
                  if (err) return reject(err);
                  resolve(decoded);
                }
              );
            });

            if (tokens.refreshToken && !tokens.refreshTokenExpiresAt) {
                tokens.refreshTokenExpiresAt = calculateNetoRefreshExpiry();
            }

            return {
              id: decoded.sub || decoded.user_id,
              name: decoded.name || "Neto User",
              email: decoded.email || `${decoded.sub}@neto.local`,
              image: undefined,
              emailVerified: decoded.email_verified ?? false,
            };
          },
        },
      ],
    }),
  ],
});
