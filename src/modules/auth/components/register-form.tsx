// src/modules/auth/components/register-form.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  registerFormSchema,
  RegisterFormValues,
} from "@/modules/auth/schemas/register-form.schema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RegisterForm() {
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
  } = useForm<RegisterFormValues>({
    resolver:
      zodResolver(
        registerFormSchema
      ),
  });

  async function onSubmit(
    data: RegisterFormValues
  ) {
    setError("");

    const response =
      await fetch(
        "/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(
            data
          ),
        }
      );

    const result =
      await response.json();

    if (!response.ok) {
      setError(
        result.error
          ?.message ??
          "Registration failed"
      );
      return;
    }

    router.push("/login");
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
          placeholder="Name"
          {...register("name")}
        />

        {errors.name && (
          <p className="text-sm text-red-500 mt-1">
            {errors.name.message}
          </p>
        )}
      </div>

      <div>
        <Input
          type="email"
          placeholder="Email"
          {...register("email")}
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
          ? "Creating Account..."
          : "Create Account"}
      </Button>
    </form>
  );
}