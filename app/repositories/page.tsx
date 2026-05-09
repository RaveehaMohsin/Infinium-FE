"use client";

import { useRouter } from "next/navigation";
import { Repositories } from "@/components/Repositories";

export default function Page() {
  const router = useRouter();

  return (
    <Repositories
      navigateTo={(page) => router.push(`/${page}`)}
    />
  );
}