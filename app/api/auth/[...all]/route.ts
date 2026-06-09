import { auth } from "@/lib/auth"; // path to your auth file
import { toNextJsHandler } from "better-auth/next-js";

export const runtime = "edge"; // Optional, but ensure dynamic handling
export const dynamic = "force-dynamic"; // Forces Next.js to skip static caching

export const { POST, GET } = toNextJsHandler(auth);
