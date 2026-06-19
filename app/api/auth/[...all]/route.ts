import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";


export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "https://neto.mcinnes.design",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export const { POST, GET } = toNextJsHandler(auth);
