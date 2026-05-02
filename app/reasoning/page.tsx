"use client";

import { useRouter } from "next/navigation";
import { ReasoningInterface } from "@/components/ReasoningInterface";

export default function Page() {
  const router = useRouter();

  return (
    <ReasoningInterface
      navigateTo={(page) => router.push(`/${page}`)}
    />
  );
}