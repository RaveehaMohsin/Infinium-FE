"use client";

import { useRouter } from "next/navigation";
import { CodeRefactor } from "@/components/CodeRefactor";

export default function Page() {
  const router = useRouter();
  return <CodeRefactor navigateTo={(page) => router.push(`/${page}`)} />;
}
