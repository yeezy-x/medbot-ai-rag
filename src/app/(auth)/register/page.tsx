import { auth } from "@/auth";
import {
  RegisterForm,
} from "@/modules/auth/components/register-form";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
    const session=await auth()
        if(session){
            redirect("/dashboard")
        }
  return (
    <RegisterForm />
  );
}