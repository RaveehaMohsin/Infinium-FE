"use client";

import { Button } from "./ui/button";
import {
  Brain,
  LayoutDashboard,
  MessageSquare,
  Clock,
  AlertTriangle,
  LineChart,
  Database,
  Plug,
  Settings,
  FolderOpen,
  BookOpen,
  FileText,
  LogOut,
  Wand2,
  Menu,
  X
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";

interface SidebarProps {
  currentPage: string;
  navigateTo: (page: string) => void;
}

export function Sidebar({ currentPage, navigateTo }: SidebarProps) {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth");
  };

  const handleNavigate = (page: string) => {
    navigateTo(page);
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  const initials = (user?.full_name || user?.username || "U")
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("") || "U";

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", page: "dashboard" as string },
    { icon: FolderOpen, label: "Repositories", page: "repositories" as string },
    { icon: Database, label: "Data Sources Indexing", page: "datasources" as string },
    { icon: MessageSquare, label: "Query Interface", page: "query" as string },
    //{ icon: Brain, label: "Reasoning", page: "reasoning" as string },
    { icon: Wand2, label: "Code Refactor", page: "code-refactor" as string },
    //{ icon: Clock, label: "Decision History", page: "decision-history" as string },
    //{ icon: AlertTriangle, label: "Error Insights", page: "error-insights" as string },
    { icon: BookOpen, label: "Document Agent", page: "knowledge" as string },
    { icon: LineChart, label: "Analytics", page: "analytics" as string },
    { icon: FileText, label: "PDF Viewer", page: "pdf" as string },
    { icon: Brain, label: "Architecture", page: "architecture" as string },
    // { icon: Clock, label: "Decision History", page: "decision-history" as string },
    // { icon: AlertTriangle, label: "Error Insights", page: "error-insights" as string },
    // { icon: Brain, label: "Reasoning", page: "reasoning" as string },
    // { icon: Plug, label: "Integrations", page: "integrations" as string },
    // { icon: Settings, label: "Settings", page: "settings" as string },
  ];

  // Sidebar content component (reused for both desktop and mobile)
  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div
        onClick={() => handleNavigate('dashboard')}
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
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.page;

          return (
            <div key={item.page} className="relative">
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#38BDF8] rounded-r"></div>
              )}
              <Button
                onClick={() => handleNavigate(item.page)}
                variant="ghost"
                className={`w-full justify-start gap-3 blueprint-highlight ${isActive
                  ? "bg-[#1E3A8A] text-white hover:bg-[#1E3A8A]"
                  : "text-[#64748B] hover:text-[#1E3A8A] hover:bg-[#F8FAFC]"
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
      <div className="p-4 border-t-2 border-[#E2E8F0] space-y-2">
        <div className="flex items-center gap-3 p-3 border-2 border-[#CBD5E1] rounded-sm hover:border-[#1E3A8A] transition-colors blueprint-highlight">
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.username || "User"}
              className="w-10 h-10 rounded-full border-2 border-[#38BDF8] object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-[#1E3A8A] border-2 border-[#38BDF8] rounded-full flex items-center justify-center text-white font-semibold">
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[#0F172A] text-sm font-medium truncate">
              {user?.full_name || user?.username || "Guest"}
            </p>
            <p className="text-[#64748B] text-xs truncate">
              {user?.email ||
                (user?.username ? `@${user.username}` : "Not signed in")}
            </p>
          </div>
        </div>
        {user && (
          <Button
            onClick={handleSignOut}
            variant="ghost"
            className="w-full justify-start gap-2 text-[#64748B] hover:text-[#EF4444] hover:bg-[#FEF2F2]"
          >
            <LogOut className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-sm">Sign out</span>
          </Button>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 bg-[#1E3A8A] text-white rounded-lg shadow-lg md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {/* Desktop Sidebar - Always visible on md+ */}
      {!isMobile && (
        <aside className="w-64 h-screen bg-white border-r-2 border-[#1E3A8A] flex flex-col relative flex-shrink-0 hidden md:flex">
          <div className="absolute right-4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#E2E8F0] to-transparent"></div>
          <SidebarContent />
        </aside>
      )}

      {/* Mobile Drawer Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <aside
          className={`fixed top-0 left-0 h-full w-72 bg-white border-r-2 border-[#1E3A8A] flex flex-col z-50 transform transition-transform duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
          {/* Close button */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute top-4 right-4 p-2 text-[#64748B] hover:text-[#1E3A8A] z-10"
          >
            <X className="w-5 h-5" />
          </button>
          <SidebarContent />
        </aside>
      )}
    </>
  );
}