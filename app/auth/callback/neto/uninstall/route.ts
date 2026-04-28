import deleteCookie from "@/components/auth/deleteCookie";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  console.log(`## LOGOUT`)
  const eatCookie = await deleteCookie('mc_design_auth')
  
  if(eatCookie) {
    console.log(`   Cookies eaten, yum!`)
    redirect('/logout')
  } else {
    throw new Error('Issue destroying session data, please retry')
  }
}
