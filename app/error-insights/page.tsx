"use client";

import { useRouter } from "next/navigation";
import { ErrorInsights } from "@/components/ErrorInsights";

export default function Page() {
  const router = useRouter();

  return (
    <ErrorInsights
      navigateTo={(page) => router.push(`/${page}`)}
    />
  );
}