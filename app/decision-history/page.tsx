"use client";

import { useRouter } from "next/navigation";
import { DecisionHistory } from "@/components/DecisionHistory";

export default function Page() {
  const router = useRouter();

  return (
    <DecisionHistory
      navigateTo={(page) => router.push(`/${page}`)}
    />
  );
}