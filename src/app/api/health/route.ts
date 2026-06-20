import { successResponse } from "@/lib/api-response";

export async function GET(){
  return successResponse({status:"healthy"},200)
}