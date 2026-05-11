"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Code, Database, GitBranch, LineChart, Zap, Shield, Users, X, Play } from "lucide-react";

interface LandingPageProps {
  onLogin: () => void;
}

export function LandingPage({ onLogin }: LandingPageProps) {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // For Google Drive video - you'll need to get the direct download link or use the embed URL
  // Method 1: Use the embed URL (replace FILE_ID with your file ID)
  const googleDriveEmbedUrl = "https://drive.google.com/file/d/1bGcJDVO_nud_2o6VWGZ0YDuMFDViPp0R/preview";
  
  // Method 2: If you can host the video elsewhere, use a direct URL
  // const videoUrl = "/path/to/your/video.mp4";

  return (
    <div className="min-h-screen bg-white blueprint-bg overflow-x-hidden">
      {/* Animated background lines - hidden on mobile */}
      <svg className="fixed inset-0 w-full h-full pointer-events-none opacity-20 hidden md:block" style={{ zIndex: 0 }}>
        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#1E3A8A" strokeWidth="1" className="blueprint-dash" />
        <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#1E3A8A" strokeWidth="1" className="blueprint-dash" />
      </svg>

      <div className="relative w-full" style={{ zIndex: 1 }}>
        {/* Header - Responsive */}
        <header className="border-b-2 border-[#1E3A8A] bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-[#1E3A8A]" strokeWidth={1.5} />
              <span className="text-xl sm:text-2xl font-semibold text-[#0F172A] tracking-tight">Infinium</span>
              <span className="text-[10px] sm:text-xs text-[#64748B] blueprint-label ml-1 sm:ml-2">v1.0</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                onClick={onLogin}
                variant="outline"
                size="sm"
                className="border-2 border-[#1E3A8A] text-[#1E3A8A] hover:bg-[#1E3A8A] hover:text-white transition-all blueprint-highlight text-sm sm:text-base px-3 sm:px-4"
              >
                Sign In
              </Button>
            </div>
          </div>
        </header>

        {/* Hero Section - Responsive */}
        <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-20 text-center">
          <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 border-2 border-[#38BDF8] rounded-sm text-[#1E3A8A] text-xs sm:text-sm mb-4">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#38BDF8] rounded-full blueprint-pulse"></div>
              Autonomous Reasoning Agent for Developer Knowledge Intelligence
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-[#0F172A] mb-4 sm:mb-6 leading-tight">
              Transform Your Team's{" "}
              <span className="relative inline-block">
                <span className="text-[#1E3A8A]">Institutional Memory</span>
                <svg className="absolute -bottom-2 left-0 w-full" height="6" style={{ display: "none" }}>
                  <line x1="0" y1="4" x2="100%" y2="4" stroke="#FACC15" strokeWidth="3" opacity="0.5" />
                </svg>
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-[#64748B] max-w-3xl mx-auto leading-relaxed px-2">
              Stop rediscovering internal knowledge. Infinium learns from your repositories, documentation, and workflows to provide contextual, reasoning-based insights directly in your development environment.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-4 sm:pt-6">
              <Button
                onClick={onLogin}
                size="lg"
                className="bg-[#1E3A8A] hover:bg-[#38BDF8] text-white px-6 sm:px-8 py-2 sm:py-3 border-2 border-[#1E3A8A] hover:border-[#38BDF8] transition-all text-sm sm:text-base"
              >
                Get Started →
              </Button>
              <Button
                onClick={() => setIsVideoModalOpen(true)}
                size="lg"
                variant="outline"
                className="border-2 border-[#CBD5E1] text-[#0F172A] hover:border-[#1E3A8A] blueprint-highlight text-sm sm:text-base px-6 sm:px-8 gap-2"
              >
                <Play className="w-4 h-4" />
                View Demo
              </Button>
            </div>
          </div>
        </section>

        {/* Features Grid - Responsive (2 columns on tablet, 1 on mobile, 3 on desktop) */}
        <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] mb-2">Core Capabilities</h2>
            <div className="w-16 sm:w-24 h-1 bg-[#38BDF8] mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <Card className="blueprint-card p-4 sm:p-6 bg-white hover:scale-[1.02] transition-transform duration-300">
              <div className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-[#1E3A8A] rounded-sm flex items-center justify-center mb-3 sm:mb-4">
                <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-[#1E3A8A]" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-[#0F172A] mb-2">Reasoning-Based Retrieval</h3>
              <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
                Unlike traditional search, Infinium understands context and provides explanations for architectural decisions and code patterns.
              </p>
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[#E2E8F0]">
                <span className="text-[10px] sm:text-xs font-mono text-[#64748B]">CORE FEATURE</span>
              </div>
            </Card>

            <Card className="blueprint-card p-4 sm:p-6 bg-white hover:scale-[1.02] transition-transform duration-300">
              <div className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-[#38BDF8] rounded-sm flex items-center justify-center mb-3 sm:mb-4">
                <Database className="w-5 h-5 sm:w-6 sm:h-6 text-[#38BDF8]" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-[#0F172A] mb-2">Multi-Source Learning</h3>
              <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
                Continuously learns from GitHub repos, documentation, error tracking, and team communications.
              </p>
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[#E2E8F0]">
                <span className="text-[10px] sm:text-xs font-mono text-[#64748B]">DATA PIPELINE</span>
              </div>
            </Card>

            <Card className="blueprint-card p-4 sm:p-6 bg-white hover:scale-[1.02] transition-transform duration-300">
              <div className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-[#FACC15] rounded-sm flex items-center justify-center mb-3 sm:mb-4">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-[#FACC15]" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-[#0F172A] mb-2">Team Collaboration</h3>
              <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
                Share insights, document decisions, and build a shared understanding across your entire engineering team.
              </p>
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[#E2E8F0]">
                <span className="text-[10px] sm:text-xs font-mono text-[#64748B]">COLLABORATION</span>
              </div>
            </Card>

            <Card className="blueprint-card p-4 sm:p-6 bg-white hover:scale-[1.02] transition-transform duration-300">
              <div className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-[#1E3A8A] rounded-sm flex items-center justify-center mb-3 sm:mb-4">
                <GitBranch className="w-5 h-5 sm:w-6 sm:h-6 text-[#1E3A8A]" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-[#0F172A] mb-2">Version Control Insights</h3>
              <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
                Traces commit histories and PR discussions to explain why specific decisions were made.
              </p>
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[#E2E8F0]">
                <span className="text-[10px] sm:text-xs font-mono text-[#64748B]">GIT INTEGRATION</span>
              </div>
            </Card>

            <Card className="blueprint-card p-4 sm:p-6 bg-white hover:scale-[1.02] transition-transform duration-300">
              <div className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-[#38BDF8] rounded-sm flex items-center justify-center mb-3 sm:mb-4">
                <LineChart className="w-5 h-5 sm:w-6 sm:h-6 text-[#38BDF8]" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-[#0F172A] mb-2">Analytics Dashboard</h3>
              <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
                Visualize knowledge trends, repeated queries, and productivity improvements across your team.
              </p>
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[#E2E8F0]">
                <span className="text-[10px] sm:text-xs font-mono text-[#64748B]">METRICS</span>
              </div>
            </Card>

            <Card className="blueprint-card p-4 sm:p-6 bg-white hover:scale-[1.02] transition-transform duration-300">
              <div className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-[#FACC15] rounded-sm flex items-center justify-center mb-3 sm:mb-4">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-[#FACC15]" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-[#0F172A] mb-2">Enterprise Security</h3>
              <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
                SOC2 compliant with role-based access control, audit logs, and data encryption at rest and in transit.
              </p>
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[#E2E8F0]">
                <span className="text-[10px] sm:text-xs font-mono text-[#64748B]">SECURITY</span>
              </div>
            </Card>
          </div>
        </section>

        {/* Stats Section - Responsive */}
        <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <div className="border-2 border-[#1E3A8A] rounded-sm p-6 sm:p-12 bg-gradient-to-br from-[#F8FAFC] to-white blueprint-brackets">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] text-center mb-8 sm:mb-12">Expected Impact</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 text-center">
              <div className="blueprint-stat">
                <div className="text-3xl sm:text-5xl font-bold text-[#1E3A8A] mb-2">30-40%</div>
                <div className="w-12 sm:w-16 h-1 bg-[#38BDF8] mx-auto mb-2"></div>
                <p className="text-sm sm:text-base text-[#64748B]">Reduction in knowledge search time</p>
              </div>
              <div className="blueprint-stat">
                <div className="text-3xl sm:text-5xl font-bold text-[#38BDF8] mb-2">≥85%</div>
                <div className="w-12 sm:w-16 h-1 bg-[#FACC15] mx-auto mb-2"></div>
                <p className="text-sm sm:text-base text-[#64748B]">Contextual accuracy rate</p>
              </div>
              <div className="blueprint-stat">
                <div className="text-3xl sm:text-5xl font-bold text-[#FACC15] mb-2">24/7</div>
                <div className="w-12 sm:w-16 h-1 bg-[#1E3A8A] mx-auto mb-2"></div>
                <p className="text-sm sm:text-base text-[#64748B]">Continuous learning & availability</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer - Responsive */}
        <footer className="border-t-2 border-[#E2E8F0] bg-white/80">
          <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 text-center">
            <p className="text-xs sm:text-sm text-[#64748B] blueprint-label">
              © 2025 Infinium - Autonomous Reasoning Agent for Developer Knowledge Intelligence
            </p>
          </div>
        </footer>
      </div>

      {/* Video Demo Modal */}
      {isVideoModalOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setIsVideoModalOpen(false)}
        >
          <div 
            className="relative w-full max-w-4xl bg-white rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-[#0F172A]">Product Demo</h3>
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-[#64748B]" />
              </button>
            </div>
            
            {/* Video Container */}
            <div className="relative aspect-video bg-black">
              <iframe
                src={googleDriveEmbedUrl}
                className="absolute inset-0 w-full h-full"
                frameBorder="0"
                allow="autoplay; encrypted-media"
                allowFullScreen
                title="Infinium Product Demo"
              />
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 bg-gray-50">
              <p className="text-sm text-[#64748B]">
                Watch how Infinium transforms your team's institutional knowledge into actionable insights.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}