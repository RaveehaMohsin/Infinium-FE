"use client";

import { useRouter } from "next/navigation";
import { Settings } from "@/components/Settings";

export default function Page() {
  const router = useRouter();

  return (
    <Settings
      navigateTo={(page) => router.push(`/${page}`)}
    />
  );
}