"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle } from "lucide-react";

function ErrorInner() {
  const router = useRouter();
  const params = useSearchParams();
  const message = params.get("message") || "Authentication failed.";

  return (
    <div className="max-w-md text-center space-y-4">
      <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
      <h1 className="text-2xl">Authentication failed</h1>
      <p className="text-gray-600">{message}</p>
      <button
        onClick={() => router.replace("/auth")}
        className="px-6 py-3 rounded-xl bg-gray-900 text-white hover:bg-gray-800 transition-colors"
      >
        Back to sign in
      </button>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white p-8">
      <Suspense fallback={null}>
        <ErrorInner />
      </Suspense>
    </main>
  );
}
