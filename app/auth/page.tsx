"use client";

import { AuthPage } from "@/components/AuthPage";
import { useRouter } from "next/navigation";

export default function Auth() {
  const router = useRouter();

  return (
    <AuthPage
      onLogin={() => router.push("/dashboard")}
      onSignUp={() => router.push("/email-verification")}
    />
  );
}