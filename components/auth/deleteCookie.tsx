'use server'

import { cookies } from 'next/headers'
 
export default async function deleteCookie(name:string) {
  const cookieJar = await cookies();
  const sortedCookieJar = cookieJar.getAll().filter((cookie) => cookie.name.includes(name));

  if(sortedCookieJar.length){
    sortedCookieJar.map((cookie) => {
      if (
        process.env.VERCEL_ENV === "development" ||
        process.env.NODE_ENV === "development"
      ) {
        cookieJar.delete(cookie.name)
      } else {
        // have to pass all the cookie params as they were set in production?
        // cookieJar.delete({ name: cookie.name, domain: ".mcinnes.design", path: "/", httpOnly: true, secure: true, sameSite: "lax" });
        cookieJar.set(cookie.name, '', {
          domain: ".mcinnes.design",
          path: "/",
          httpOnly: true,
          secure: true,
          sameSite: "lax",
          maxAge: 0,
        });
      } 
      // issue deleting cookie
      if(cookieJar.has(cookie.name)) return 0
    })
    // all cookies deleted
    return 1
  } else {
    // no cookie to begin with
    return 1
  }
}
