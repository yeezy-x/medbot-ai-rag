import { NextRequest, NextResponse } from "next/server";

export {
  auth as middleware,
} from "@/auth";


export function proxy(request:NextRequest){
  return NextResponse.redirect(new URL('/home',request.url))
}
export const config = {
  matcher: [
    "/chat/:path*",
    "/dashboard/:path*",
  ]
};