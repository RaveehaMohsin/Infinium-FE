"use client";

import { useRouter } from "next/navigation";
import { DataSources } from "@/components/DataSources";

export default function Page() {
  const router = useRouter();

  return (
    <DataSources
      navigateTo={(page) => router.push(`/${page}`)}
    />
  );
}