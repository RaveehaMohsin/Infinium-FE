"use client";

import { QueryInterface } from "@/components/QueryInterface";
import { useRouter } from "next/navigation";
import { RequireAuth } from "@/lib/require-auth";

export default function Page() {
  const router = useRouter();

  return (
    <RequireAuth>
      <QueryInterface navigateTo={(page) => router.push(`/${page}`)} />
    </RequireAuth>
  );
}
