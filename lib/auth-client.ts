import { createAuthClient } from "better-auth/react"
import { genericOAuthClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
    baseURL: process.env.VERCEL_ENV === "development" || process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://mcinnes.design",
    callbackURL: `${process.env.VERCEL_ENV === "development" || process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://mcinnes.design"}/account`,
    plugins: [
        genericOAuthClient() 
    ]
})
