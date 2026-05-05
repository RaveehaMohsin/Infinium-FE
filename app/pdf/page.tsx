"use client";

import { PdfViewer } from "@/components/PdfViewer";
import { useRouter } from "next/navigation";
import { RequireAuth } from "@/lib/require-auth";

export default function PdfPage() {
  const router = useRouter();

  return (
    <RequireAuth>
      <PdfViewer navigateTo={(page) => router.push(`/${page}`)} />
    </RequireAuth>
  );
}
