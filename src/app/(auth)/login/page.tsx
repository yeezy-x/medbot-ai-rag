import { auth } from "@/auth";
import {
  LoginForm,
} from "@/modules/auth/components/login-form";
import { redirect } from "next/navigation";

export default async function LoginPage() {
    const session=await auth()
    if(session){
        redirect("/dashboard")
    }
  return (
    <LoginForm />
  );
}