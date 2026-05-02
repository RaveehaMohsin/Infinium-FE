"use client";

import { QueryInterface } from "@/components/QueryInterface";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  return (
    <QueryInterface
      navigateTo={(page) => router.push(`/${page}`)}
    />
  );
}