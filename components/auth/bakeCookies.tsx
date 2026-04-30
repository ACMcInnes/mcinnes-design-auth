'use server'

import { cookies } from 'next/headers'
 
export default async function bakeCookies(version: string, data: string) {
  console.log(`   Mixing cookie batter...`);
  const size = 3000; // maximum size of each chunk
  const regex = new RegExp(".{1," + size + "}", "g");
  const cookieChunks = data.match(regex);
  const cookieJar = await cookies();

  console.log(`   Baking cookies...`);

  if (cookieChunks && cookieChunks.length) {
    for (const [index, cookieChunk] of cookieChunks.entries()) {
      console.log(`   mc_design_auth_${version}.${index}`);
      if (
        process.env.VERCEL_ENV === "development" ||
        process.env.NODE_ENV === "development"
      ) {
        console.log(`      lax cookie`);
        cookieJar.set(`mc_design_auth_${version}.${index}`, cookieChunk, {
          httpOnly: true,
          sameSite: "lax",
          secure: false,
          path: "/",
        });
      } else {
        console.log(`      secure cookie`);
        cookieJar.set(`mc_design_auth_${version}.${index}`, cookieChunk, {
          httpOnly: true,
          sameSite: "strict",
          secure: true,
          path: "/",
        });
      }
      console.log(
        `      baked: ${cookieJar.has(`mc_design_auth_${version}.${index}`)}`
      );
    }
  } else {
    throw new Error(`Could not bake cookies - account info may be missing`)
  }
}
