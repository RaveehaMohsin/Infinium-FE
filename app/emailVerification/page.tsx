"use client";

import { EmailVerification } from "@/components/EmailVerification";
import { useRouter } from "next/navigation";

export default function EmailVerificationPage() {
  const router = useRouter();

  return (
    <EmailVerification
      email="user@example.com" // temp (later from state/backend)
      onVerified={() => {
        router.push("/onboarding");
      }}
    />
  );
}