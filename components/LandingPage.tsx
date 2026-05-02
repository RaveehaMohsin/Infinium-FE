"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Code, Database, GitBranch, LineChart, Zap } from "lucide-react";

interface LandingPageProps {
  onLogin: () => void;
}

export function LandingPage({ onLogin }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white blueprint-bg">
      {/* Animated background lines */}
      <svg className="fixed inset-0 w-full h-full pointer-events-none opacity-20" style={{ zIndex: 0 }}>
        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#1E3A8A" strokeWidth="1" className="blueprint-dash" />
        <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#1E3A8A" strokeWidth="1" className="blueprint-dash" />
      </svg>

      <div className="relative" style={{ zIndex: 1 }}>
        {/* Header */}
        <header className="border-b-2 border-[#1E3A8A] bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-8 h-8 text-[#1E3A8A]" strokeWidth={1.5} />
              <span className="text-2xl font-semibold text-[#0F172A] tracking-tight">Infinium</span>
              <span className="text-xs text-[#64748B] blueprint-label ml-2">v1.0</span>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                className="border-2 border-[#38BDF8] text-[#1E3A8A] hover:bg-[#38BDF8] hover:text-white transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download VSCode Extension
              </Button>
              <Button
                onClick={onLogin}
                variant="outline"
                className="border-2 border-[#1E3A8A] text-[#1E3A8A] hover:bg-[#1E3A8A] hover:text-white transition-all blueprint-highlight"
              >
                Sign In
              </Button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-6 py-20 text-center">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 border-2 border-[#38BDF8] rounded-sm text-[#1E3A8A] text-sm mb-4">
              <div className="w-2 h-2 bg-[#38BDF8] rounded-full blueprint-pulse"></div>
              Autonomous Reasoning Agent for Developer Knowledge Intelligence
            </div>

            <h1 className="text-6xl font-bold text-[#0F172A] mb-6 leading-tight">
              Transform Your Team's{" "}
              <span className="relative inline-block">
                <span className="text-[#1E3A8A]">Institutional Memory</span>
                <svg className="absolute -bottom-2 left-0 w-full" height="8">
                  <line x1="0" y1="4" x2="100%" y2="4" stroke="#FACC15" strokeWidth="4" opacity="0.5" />
                </svg>
              </span>
            </h1>

            <p className="text-xl text-[#64748B] max-w-3xl mx-auto leading-relaxed">
              Stop rediscovering internal knowledge. Infinium learns from your repositories, documentation, and workflows to provide contextual, reasoning-based insights directly in your development environment.
            </p>

            <div className="flex gap-4 justify-center pt-6">
              <Button
                onClick={onLogin}
                size="lg"
                className="bg-[#1E3A8A] hover:bg-[#38BDF8] text-white px-8 border-2 border-[#1E3A8A] hover:border-[#38BDF8] transition-all"
              >
                Get Started →
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-[#CBD5E1] text-[#0F172A] hover:border-[#1E3A8A] blueprint-highlight"
              >
                View Demo
              </Button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="container mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0F172A] mb-2">Core Capabilities</h2>
            <div className="w-24 h-1 bg-[#38BDF8] mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="blueprint-card p-6 bg-white hover:scale-[1.02] transition-transform duration-300">
              <div className="w-12 h-12 border-2 border-[#1E3A8A] rounded-sm flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-[#1E3A8A]" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-semibold text-[#0F172A] mb-2">Reasoning-Based Retrieval</h3>
              <p className="text-[#64748B] leading-relaxed">
                Unlike traditional search, Infinium understands context and provides explanations for architectural decisions and code patterns.
              </p>
              <div className="mt-4 pt-4 border-t border-[#E2E8F0]">
                <span className="blueprint-label">Core Feature</span>
              </div>
            </Card>

            <Card className="blueprint-card p-6 bg-white hover:scale-[1.02] transition-transform duration-300">
              <div className="w-12 h-12 border-2 border-[#38BDF8] rounded-sm flex items-center justify-center mb-4">
                <Database className="w-6 h-6 text-[#38BDF8]" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-semibold text-[#0F172A] mb-2">Multi-Source Learning</h3>
              <p className="text-[#64748B] leading-relaxed">
                Continuously learns from GitHub repos, CI/CD logs, documentation, error tracking, and team communications.
              </p>
              <div className="mt-4 pt-4 border-t border-[#E2E8F0]">
                <span className="blueprint-label">Data Pipeline</span>
              </div>
            </Card>

            <Card className="blueprint-card p-6 bg-white hover:scale-[1.02] transition-transform duration-300">
              <div className="w-12 h-12 border-2 border-[#FACC15] rounded-sm flex items-center justify-center mb-4">
                <Code className="w-6 h-6 text-[#FACC15]" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-semibold text-[#0F172A] mb-2">IDE Integration</h3>
              <p className="text-[#64748B] leading-relaxed">
                VSCode extension provides inline contextual Q&A without leaving your development environment.
              </p>
              <div className="mt-4 pt-4 border-t border-[#E2E8F0]">
                <span className="blueprint-label">Developer Tool</span>
              </div>
            </Card>

            <Card className="blueprint-card p-6 bg-white hover:scale-[1.02] transition-transform duration-300">
              <div className="w-12 h-12 border-2 border-[#1E3A8A] rounded-sm flex items-center justify-center mb-4">
                <GitBranch className="w-6 h-6 text-[#1E3A8A]" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-semibold text-[#0F172A] mb-2">Version Control Insights</h3>
              <p className="text-[#64748B] leading-relaxed">
                Traces commit histories and PR discussions to explain why specific decisions were made.
              </p>
              <div className="mt-4 pt-4 border-t border-[#E2E8F0]">
                <span className="blueprint-label">Git Integration</span>
              </div>
            </Card>

            <Card className="blueprint-card p-6 bg-white hover:scale-[1.02] transition-transform duration-300">
              <div className="w-12 h-12 border-2 border-[#38BDF8] rounded-sm flex items-center justify-center mb-4">
                <LineChart className="w-6 h-6 text-[#38BDF8]" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-semibold text-[#0F172A] mb-2">Analytics Dashboard</h3>
              <p className="text-[#64748B] leading-relaxed">
                Visualize knowledge trends, repeated queries, and productivity improvements across your team.
              </p>
              <div className="mt-4 pt-4 border-t border-[#E2E8F0]">
                <span className="blueprint-label">Metrics</span>
              </div>
            </Card>

            <Card className="blueprint-card p-6 bg-white hover:scale-[1.02] transition-transform duration-300">
              <div className="w-12 h-12 border-2 border-[#FACC15] rounded-sm flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-[#FACC15]" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-semibold text-[#0F172A] mb-2">Real-Time Learning</h3>
              <p className="text-[#64748B] leading-relaxed">
                Automatically updates knowledge base from team interactions and evolving codebases.
              </p>
              <div className="mt-4 pt-4 border-t border-[#E2E8F0]">
                <span className="blueprint-label">Continuous</span>
              </div>
            </Card>
          </div>
        </section>

        {/* Stats Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="border-2 border-[#1E3A8A] rounded-sm p-12 bg-gradient-to-br from-[#F8FAFC] to-white blueprint-brackets">
            <h2 className="text-3xl font-bold text-[#0F172A] text-center mb-12">Expected Impact</h2>
            <div className="grid md:grid-cols-3 gap-12 text-center">
              <div className="blueprint-stat">
                <div className="text-5xl font-bold text-[#1E3A8A] mb-2">30-40%</div>
                <div className="w-16 h-1 bg-[#38BDF8] mx-auto mb-2"></div>
                <p className="text-[#64748B]">Reduction in knowledge search time</p>
              </div>
              <div className="blueprint-stat">
                <div className="text-5xl font-bold text-[#38BDF8] mb-2">≥85%</div>
                <div className="w-16 h-1 bg-[#FACC15] mx-auto mb-2"></div>
                <p className="text-[#64748B]">Contextual accuracy rate</p>
              </div>
              <div className="blueprint-stat">
                <div className="text-5xl font-bold text-[#FACC15] mb-2">24/7</div>
                <div className="w-16 h-1 bg-[#1E3A8A] mx-auto mb-2"></div>
                <p className="text-[#64748B]">Continuous learning & availability</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t-2 border-[#E2E8F0] bg-white/80">
          <div className="container mx-auto px-6 py-8 text-center">
            <p className="text-[#64748B] blueprint-label">
              © 2025 Infinium - Autonomous Reasoning Agent for Developer Knowledge Intelligence
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
