"use client";

import { useRouter } from "next/navigation";
import { KnowledgeBase } from "@/components/KnowledgeBase";

export default function Page() {
  const router = useRouter();

  return (
    <KnowledgeBase
      navigateTo={(page) => router.push(`/${page}`)}
    />
  );
}