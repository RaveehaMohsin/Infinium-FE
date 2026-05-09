"use client";

import { useRouter } from "next/navigation";
import { DataSources } from "@/components/DataSources";
import { RequireAuth } from "@/lib/require-auth";

export default function Page() {
  const router = useRouter();

  return (
    <RequireAuth>
      <DataSources navigateTo={(page) => router.push(`/${page}`)} />
    </RequireAuth>
  );
}
