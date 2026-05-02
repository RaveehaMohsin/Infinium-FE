"use client";

import { useRouter } from "next/navigation";
import { Integrations } from "@/components/Integrations";

export default function Page() {
  const router = useRouter();

  return (
    <Integrations
      navigateTo={(page) => router.push(`/${page}`)}
    />
  );
}