"use client";

import { useRouter } from "next/navigation";
import { Architecture } from "@/components/Architecture";

export default function Page() {
  const router = useRouter();

  return (
    <Architecture
      navigateTo={(page) => router.push(`/${page}`)}
    />
  );
}