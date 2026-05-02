"use client";

import { useRouter } from "next/navigation";
import { Analytics } from "@/components/Analytics";

export default function Page() {
  const router = useRouter();

  return (
    <Analytics
      navigateTo={(page) => router.push(`/${page}`)}
    />
  );
}