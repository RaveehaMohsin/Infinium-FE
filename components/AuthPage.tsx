"use client";

import { useState } from "react";
import { Brain, Building2, Shield, ArrowRight, Loader2 } from "lucide-react";
import { ApiError, authApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface AuthPageProps {
  onLogin: () => void;
  onSignUp: () => void;
}

export function AuthPage({ onLogin, onSignUp }: AuthPageProps) {
  const { refresh } = useAuth();
  const [isSignIn, setIsSignIn] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (isSignIn) {
        await authApi.login({
          email: formData.email,
          password: formData.password,
        });
        await refresh();
        onLogin();
      } else {
        await authApi.register({
          email: formData.email,
          username: formData.username,
          password: formData.password,
          full_name: formData.fullName || undefined,
        });
        await refresh();
        onSignUp();
      }
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleGithubLogin = () => {
    window.location.href = authApi.getGithubLoginUrl();
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-colors";

  const labelClass = "block text-sm font-medium text-gray-700 mb-2";

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 mb-6">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-semibold tracking-tight">Infinium</span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight mb-2">
              {isSignIn ? "Welcome back" : "Create account"}
            </h1>
            <p className="text-gray-600 text-sm leading-relaxed">
              {isSignIn
                ? "Sign in to access your workspace"
                : "Start building organizational memory"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isSignIn && (
              <div>
                <label className={labelClass} htmlFor="fullName">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="John Doe"
                />
              </div>
            )}

            {!isSignIn && (
              <div>
                <label className={labelClass} htmlFor="username">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="johndoe"
                  required={!isSignIn}
                  autoComplete="username"
                />
              </div>
            )}

            <div>
              <label className={labelClass} htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={inputClass}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={inputClass}
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete={isSignIn ? "current-password" : "new-password"}
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl border border-red-200 bg-red-50 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gray-900 text-white text-sm font-medium px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Please wait…
                </>
              ) : (
                <>
                  {isSignIn ? "Sign In" : "Create Account"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-white text-xs uppercase tracking-wide text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGithubLogin}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.597 1.028 2.688 0 3.848-2.339 4.685-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              Continue with GitHub
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setError(null);
                setIsSignIn(!isSignIn);
              }}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              {isSignIn ? (
                <>
                  Don&apos;t have an account?{" "}
                  <span className="text-gray-900 font-medium">Sign up</span>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <span className="text-gray-900 font-medium">Sign in</span>
                </>
              )}
            </button>
          </div>

          {/* Permission Notice */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex gap-3">
              <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-blue-900 mb-1">
                  Permission-Aware Access
                </h3>
                <p className="text-xs text-blue-700 leading-relaxed">
                  Infinium respects your organization&apos;s access controls.
                  You&apos;ll only see data you have permission to access.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-gray-900 to-gray-800 p-12 items-center justify-center relative overflow-hidden">
        <div className="relative z-10 max-w-lg text-white">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
            <Building2 className="w-4 h-4" />
            <span className="text-sm font-medium">Enterprise Ready</span>
          </div>

          <h2 className="text-4xl font-semibold tracking-tight mb-6 leading-tight">
            Build Knowledge That Grows With Your Team
          </h2>

          <p className="text-lg text-gray-300 leading-relaxed mb-10">
            Infinium learns from every commit, every decision, and every
            documentation update — creating a living memory of your
            organization&apos;s development journey.
          </p>

          <div className="space-y-3">
            {[
              "Contextual reasoning with evidence",
              "Self-learning from your codebase",
              "Explainable AI insights",
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400" />
                <span className="text-gray-300 text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative grid */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {/* Floating dots */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-blue-500 rounded-full mix-blend-screen filter blur-xl opacity-20 animate-pulse pointer-events-none" />
        <div
          className="absolute bottom-20 left-20 w-40 h-40 bg-cyan-500 rounded-full mix-blend-screen filter blur-xl opacity-20 animate-pulse pointer-events-none"
          style={{ animationDelay: "2s" }}
        />
      </div>
    </div>
  );
}
