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

export function RegisterForm() {
  const router = useRouter();

  const form =
    useForm<RegisterFormValues>({
      resolver:
        zodResolver(
          registerFormSchema
        ),

      defaultValues: {
        name: "",
        email: "",
        password: "",
      },
    });

  async function onSubmit(
    values: RegisterFormValues
  ) {
    await registerUser(values);
    router.push("/login");
  }

  return (
    <form
      onSubmit={form.handleSubmit(
        onSubmit
      )}
    >
      Register Form
    </form>
  );
}