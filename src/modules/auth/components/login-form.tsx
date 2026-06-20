"use client";

import { useForm }
from "react-hook-form";

import { zodResolver }
from "@hookform/resolvers/zod";

import {
  registerFormSchema,
  RegisterFormValues,
} from "../schemas/register-form.schema";
import { registerUser } from "../api/register";
import { useRouter } from "next/navigation";
import { loginFormSchema, LoginFormValues } from "../schemas/login-form.schema";
import { loginUser } from "../api/login";

export function LoginForm() {
  const router = useRouter();

  const form =
    useForm<LoginFormValues>({
      resolver:
        zodResolver(
          loginFormSchema
        ),

      defaultValues: {
        email: "",
        password: "",
      },
    });

  async function onSubmit(
    values: LoginFormValues
  ) {
    await loginUser(values);
    router.push("/dashboard");
  }

  return (
    <form
      onSubmit={form.handleSubmit(
        onSubmit
      )}
    >
      Login Form
    </form>
  );
}