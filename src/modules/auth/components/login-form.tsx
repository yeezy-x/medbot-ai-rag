"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  loginFormSchema,
  LoginFormValues,
} from "@/modules/auth/schemas/login-form.schema";

import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();

  const [error, setError] =
    useState("");

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<LoginFormValues>({
    resolver:
      zodResolver(
        loginFormSchema
      ),
  });

  async function onSubmit(
    data: LoginFormValues
  ) {
    setError("");

    const result =
      await signIn(
        "credentials",
        {
          email: data.email,
          password:
            data.password,
          redirect: false,
        }
      );

    if (!result?.ok) {
      setError(
        "Invalid credentials"
      );
      return;
    }

    router.push(
      "/dashboard"
    );

    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit(
        onSubmit
      )}
      className="space-y-4"
    >
      <div>
        <Input
          type="email"
          placeholder="Email"
          {...register(
            "email"
          )}
        />

        {errors.email && (
          <p className="text-sm text-red-500 mt-1">
            {
              errors.email
                .message
            }
          </p>
        )}
      </div>

      <div>
        <Input
          type="password"
          placeholder="Password"
          {...register(
            "password"
          )}
        />

        {errors.password && (
          <p className="text-sm text-red-500 mt-1">
            {
              errors.password
                .message
            }
          </p>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-500">
          {error}
        </p>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={
          isSubmitting
        }
      >
        {isSubmitting
          ? "Signing In..."
          : "Sign In"}
      </Button>
    </form>
  );
}