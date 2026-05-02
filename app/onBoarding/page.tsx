"use client";

import { OnboardingFlow } from "@/components/OnboardingFlow";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();

  return (
    <OnboardingFlow
      onComplete={() => {
        router.push("/dashboard");
      }}
    />
  );
}