'use server'

import { cookies } from 'next/headers'
 
export default async function bakeCookies(version: string, data: string) {
  const daysInMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0,
  ).getDate();

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
        console.log(`      dev cookie`);
        cookieJar.set(`mc_design_auth_${version}.${index}`, cookieChunk, {
          path: "/",
          httpOnly: true,
          secure: false,
          sameSite: "lax",
        });
      } else {
        console.log(`      production cookie`);
        cookieJar.set(`mc_design_auth_${version}.${index}`, cookieChunk, {
          domain: ".mcinnes.design",
          path: "/",
          httpOnly: true,
          secure: true,
          sameSite: "lax",
          maxAge: daysInMonth * 24 * 60 * 60,
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
