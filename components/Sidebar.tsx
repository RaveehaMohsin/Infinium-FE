"use client";

import { Button } from "./ui/button";
import {
  Brain,
  LayoutDashboard,
  MessageSquare,
  Sparkles,
  Clock,
  AlertTriangle,
  LineChart,
  Database,
  Plug,
  Settings,
  FolderOpen
} from "lucide-react";

interface SidebarProps {
  currentPage: string;
  navigateTo: (page: string ) => void;
}

export function Sidebar({ currentPage, navigateTo }: SidebarProps) {
  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", page: "dashboard" as string },
    { icon: MessageSquare, label: "Query Interface", page: "query" as string },
    { icon: Brain, label: "Reasoning", page: "reasoning" as string },
    { icon: Clock, label: "Decision History", page: "decision-history" as string },
    { icon: AlertTriangle, label: "Error Insights", page: "error-insights" as string },
    { icon: FolderOpen, label: "Knowledge Base", page: "knowledge" as string },
    { icon: LineChart, label: "Analytics", page: "analytics" as string },
    { icon: Database, label: "Data Sources", page: "datasources" as string },
    { icon: Plug, label: "Integrations", page: "integrations" as string },
    { icon: Settings, label: "Settings", page: "settings" as string },
  ];

  return (
    <aside className="w-64 h-screen bg-white border-r-2 border-[#1E3A8A] flex flex-col relative">
      {/* Vertical line decoration */}
      <div className="absolute right-4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#E2E8F0] to-transparent"></div>

      {/* Logo */}
      <div
        onClick={() => navigateTo('dashboard')}
        className="p-6 border-b-2 border-[#E2E8F0] cursor-pointer hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2 blueprint-underline">
          <Brain className="w-8 h-8 text-[#1E3A8A]" strokeWidth={1.5} />
          <div>
            <span className="text-xl font-semibold text-[#0F172A]">Infinium</span>
            <p className="blueprint-label text-[10px] mt-0.5">Knowledge AI</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.page;

          return (
            <div key={item.page} className="relative">
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#38BDF8] rounded-r"></div>
              )}
              <Button
                onClick={() => navigateTo(item.page)}
                variant="ghost"
                className={`w-full justify-start gap-3 blueprint-highlight ${isActive
                  ? "bg-[#1E3A8A] text-white hover:bg-[#1E3A8A] border-l-2 border-[#38BDF8]"
                  : "text-[#64748B] hover:text-[#1E3A8A] hover:bg-[#F8FAFC] border-l-2 border-transparent"
                  }`}
              >
                <Icon className="w-5 h-5" strokeWidth={1.5} />
                <span className="text-sm">{item.label}</span>
              </Button>
            </div>
          );
        })}
      </nav>

      {/* Connection Lines Decoration */}
      <div className="px-4 mb-4">
        <div className="border-t border-[#E2E8F0] pt-4">
          <div className="flex items-center gap-2 text-xs text-[#64748B]">
            <div className="w-2 h-2 border border-[#38BDF8] rounded-full blueprint-pulse"></div>
            <span className="blueprint-label">System Active</span>
          </div>
        </div>
      </div>

      {/* User Section */}
      <div className="p-4 border-t-2 border-[#E2E8F0]">
        <div className="flex items-center gap-3 p-3 border-2 border-[#CBD5E1] rounded-sm hover:border-[#1E3A8A] transition-colors blueprint-highlight">
          <div className="w-10 h-10 bg-[#1E3A8A] border-2 border-[#38BDF8] rounded-full flex items-center justify-center text-white font-semibold">
            DM
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[#0F172A] text-sm font-medium truncate">Dev Manager</p>
            <p className="text-[#64748B] text-xs truncate">dev@company.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
