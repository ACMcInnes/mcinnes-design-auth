'use server'

import { cookies } from 'next/headers'
import decodeJSON from "@/components/auth/decodeJSON";
 
export default async function getCookie(name:string) {
  const cookieJar = (await cookies()).getAll();
  const sortedCookieJar = cookieJar.filter((cookie) => cookie.name.includes(name));

  if(sortedCookieJar.length){
    sortedCookieJar.sort((a, b) => {
      const crumbA = a.name.toUpperCase();
      const crumbB = b.name.toUpperCase();
      if (crumbA < crumbB) return -1;
      if (crumbA > crumbB) return 1;
      return 0;
    });
    return await decodeJSON(sortedCookieJar.map((cookie) => cookie.value).join(""))
  } else {
    return {}
  }
}