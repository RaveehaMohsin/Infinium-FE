"use client";

import { useRouter } from "next/navigation";
import { Feedback } from "@/components/Feedback";

export default function Page() {
  const router = useRouter();

  return (
    <Feedback
      navigateTo={(page) => router.push(`/${page}`)}
    />
  );
}