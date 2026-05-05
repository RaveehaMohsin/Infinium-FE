"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Brain, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

function CallbackInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { setSession } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      setError("Missing token in callback URL.");
      return;
    }
    let cancelled = false;
    (async () => {
      const me = await setSession(token);
      if (cancelled) return;
      if (me) {
        router.replace("/dashboard");
      } else {
        setError("We couldn't verify your session. Please sign in again.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params, router, setSession]);

  if (error) {
    return (
      <div className="max-w-md text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h1 className="text-2xl">Authentication failed</h1>
        <p className="text-gray-600">{error}</p>
        <button
          onClick={() => router.replace("/auth")}
          className="px-6 py-3 rounded-xl bg-gray-900 text-white hover:bg-gray-800 transition-colors"
        >
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <div className="text-center space-y-4">
      <div className="inline-flex items-center gap-2">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <span className="text-2xl">Infinium</span>
      </div>
      <div className="flex items-center justify-center gap-2 text-gray-600">
        <Loader2 className="w-5 h-5 animate-spin" />
        Finishing sign in…
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white p-8">
      <Suspense
        fallback={
          <div className="flex items-center gap-2 text-gray-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            Finishing sign in…
          </div>
        }
      >
        <CallbackInner />
      </Suspense>
    </main>
  );
}
