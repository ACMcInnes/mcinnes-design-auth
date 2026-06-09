import { defineConfig } from 'drizzle-kit';
import { loadEnvConfig } from "@next/env";

// This manually forces Next.js to parse and inject your .env.local file
loadEnvConfig(process.cwd());

console.log(`DATABASE:`)
console.log(process.env.DATABASE_URL)

export default defineConfig({
  out: './drizzle',
  schema: './schema',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
