'use server'

import { cookies } from 'next/headers'
 
export default async function deleteCookie(name:string) {
  const cookieJar = await cookies();
  const sortedCookieJar = cookieJar.getAll().filter((cookie) => cookie.name.includes(name));

  if(sortedCookieJar.length){
    sortedCookieJar.map((cookie) => {
      cookieJar.delete(cookie.name)
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
