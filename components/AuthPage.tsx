"use client";

import { useState } from "react";
import { Brain, Building2, Shield, ArrowRight } from "lucide-react";

interface AuthPageProps {
  onLogin: () => void;
  onSignUp: () => void;
}

export function AuthPage({ onLogin, onSignUp }: AuthPageProps) {
  const [isSignIn, setIsSignIn] = useState(true);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    organization: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignIn) {
      onLogin();
    } else {
      onSignUp();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl">Infinium</span>
            </div>
            <h1 className="text-3xl mb-2">
              {isSignIn ? "Welcome back" : "Create account"}
            </h1>
            <p className="text-gray-600">
              {isSignIn
                ? "Sign in to access your workspace"
                : "Start building organizational memory"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isSignIn && (
              <div>
                <label className="block text-sm mb-2 font-['Inter']">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 font-['Inter']"
                  placeholder="John Doe"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm mb-2 font-['Inter']">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 font-['Inter']"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-2 font-['Inter']">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 font-['Inter']"
                placeholder="••••••••"
                required
              />
            </div>

            {!isSignIn && (
              <div>
                <label className="block text-sm mb-2 font-['Inter']">Organization</label>
                <input
                  type="text"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 font-['Inter']"
                  placeholder="Your Company"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 font-['Inter']"
            >
              {isSignIn ? "Sign In" : "Create Account"}
              <ArrowRight className="w-5 h-5" />
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500 font-['Inter']">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button type="button" className="flex items-center justify-center px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.597 1.028 2.688 0 3.848-2.339 4.685-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </button>
              <button type="button" className="flex items-center justify-center px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5 text-[#FC6D26]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 4.82 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0 1 18.6 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.51L23 13.45a.84.84 0 0 1-.35.94z" />
                </svg>
              </button>
              <button type="button" className="flex items-center justify-center px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignIn(!isSignIn)}
              className="text-sm text-gray-600 hover:text-gray-900 font-['Inter']"
            >
              {isSignIn
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>

          {/* Permission Notice */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex gap-3">
              <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm text-blue-900 mb-1 font-['Space_Grotesk']">
                  Permission-Aware Access
                </h3>
                <p className="text-xs text-blue-700 leading-relaxed font-['Inter']">
                  Infinium respects your organization's access controls. You'll only see data you have permission to access.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-gray-900 to-gray-800 p-12 items-center justify-center relative overflow-hidden">
        <div className="relative z-10 max-w-lg text-white">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
            <Building2 className="w-4 h-4" />
            <span className="text-sm font-['Inter']">Enterprise Ready</span>
          </div>

          <h2 className="text-4xl mb-6 leading-tight font-['Space_Grotesk']">
            Build Knowledge That Grows With Your Team
          </h2>

          <p className="text-lg text-gray-300 leading-relaxed mb-8 font-['Inter']">
            Infinium learns from every commit, every decision, and every documentation update—creating a living memory of your organization's development journey.
          </p>

          <div className="space-y-4">
            {[
              "Contextual reasoning with evidence",
              "Self-learning from your codebase",
              "Explainable AI insights"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400"></div>
                <span className="text-gray-300 font-['Inter']">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative grid */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        {/* Floating dots */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-blue-500 rounded-full mix-blend-screen filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-cyan-500 rounded-full mix-blend-screen filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
    </div>
  );
}
