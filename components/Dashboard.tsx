"use client";
import { Sidebar } from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  GitCommit,
  FileText,
  Activity,
  ArrowRight,
  Loader2,
  Database,
  User,
  LogOut,
  Mail,
} from "lucide-react";
import { useEffect, useState } from "react";
import { dashboardApi, ApiError, authApi } from "@/lib/api";
import type { DashboardStats, User as UserType } from "@/lib/api/types";
import { useAuth } from "@/lib/auth-context";

interface DashboardProps {
  navigateTo: (page: string) => void;
}

export function Dashboard({ navigateTo }: DashboardProps) {
  const { user: authUser, signOut, refresh } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await dashboardApi.getDashboardStats();
        setStats(data);
      } catch (err) {
        const message = err instanceof ApiError ? err.message : "Failed to load dashboard stats";
        setError(message);
      } finally {
        setLoading(false);
      }
    }
    async function loadUser() {
      try {
        const userData = await authApi.getMe();
        setUser(userData);
      } catch (err) {
        console.error("Failed to load user:", err);
      }
    }
    loadStats();
    loadUser();
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigateTo("login");
  };

  // Get only first 4 recent queries
  const recentQueries = stats?.recent_activity?.recent_queries?.slice(0, 4).map((q, i) => ({
    id: i,
    query: q.question.length > 80 ? q.question.substring(0, 80) + "..." : q.question,
    time: new Date(q.asked_at).toLocaleDateString() + " " + new Date(q.asked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: "answered",
    repo: q.repo_name
  })) || [];

  // Get only first 4 active repos (completed ones)
  const activeRepos = stats?.recent_activity?.recently_indexed?.slice(0, 4).filter(r => r.chunks > 0) || [];

  // Get user avatar URL or fallback
  const getAvatarUrl = () => {
    if (user?.avatar_url) return user.avatar_url;
    if (user?.auth_provider === "github") {
      return `https://github.com/${user?.username}.png`;
    }
    return null;
  };

  const getUserInitial = () => {
    if (user?.full_name) return user.full_name.charAt(0).toUpperCase();
    if (user?.username) return user.username.charAt(0).toUpperCase();
    return "U";
  };

  return (
    <div className="flex h-screen bg-white blueprint-bg overflow-hidden">
      <Sidebar currentPage="dashboard" navigateTo={navigateTo} />

      <main className="flex-1 overflow-y-auto">
        {/* Header with Profile */}
        <header className="bg-white border-b-2 border-[#1E3A8A] px-4 sm:px-8 py-4 sm:py-6 sticky top-0 z-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 sm:h-8 bg-[#38BDF8]"></div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">Dashboard</h1>
                <p className="text-sm text-[#64748B] mt-1 hidden sm:block">Monitor your knowledge intelligence system</p>
              </div>
            </div>

            {/* Profile Section */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors border-2 border-transparent hover:border-[#E2E8F0]"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1E3A8A] to-[#38BDF8] flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                  {getAvatarUrl() ? (
                    <img src={getAvatarUrl()!} alt={user?.username} className="w-full h-full object-cover" />
                  ) : (
                    getUserInitial()
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-[#0F172A]">{user?.full_name || user?.username}</p>
                  <p className="text-xs text-[#64748B]">{user?.auth_provider === "github" ? "GitHub" : "Email"} User</p>
                </div>
              </button>

              {/* Dropdown Menu */}
              {showProfileMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowProfileMenu(false)} />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border-2 border-[#E2E8F0] z-20 overflow-hidden">
                    <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1E3A8A] to-[#38BDF8] flex items-center justify-center text-white font-bold text-xl overflow-hidden">
                          {getAvatarUrl() ? (
                            <img src={getAvatarUrl()!} alt={user?.username} className="w-full h-full object-cover" />
                          ) : (
                            getUserInitial()
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-[#0F172A]">{user?.full_name || user?.username}</p>
                          <p className="text-xs text-[#64748B]">{user?.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">                     
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-8 space-y-4 sm:space-y-6">
          {error && (
            <div className="rounded-md border-2 border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Stats Grid - Responsive 2x2 on mobile, 4x1 on desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <Card className="blueprint-card p-4 sm:p-6 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#64748B] text-xs sm:text-sm blueprint-label">Indexed Repos</p>
                  <p className="text-2xl sm:text-3xl font-bold text-[#0F172A] mt-1 sm:mt-2">
                    {loading ? <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" /> : stats?.repositories_indexed || 0}
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-12 sm:h-12 border-2 border-[#1E3A8A] rounded-sm flex items-center justify-center">
                  <GitCommit className="w-4 h-4 sm:w-6 sm:h-6 text-[#1E3A8A]" />
                </div>
              </div>
            </Card>

            <Card className="blueprint-card p-4 sm:p-6 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#64748B] text-xs sm:text-sm blueprint-label">Total Queries</p>
                  <p className="text-2xl sm:text-3xl font-bold text-[#0F172A] mt-1 sm:mt-2">
                    {loading ? <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" /> : stats?.total_queries || 0}
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-12 sm:h-12 border-2 border-[#FACC15] rounded-sm flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 sm:w-6 sm:h-6 text-[#FACC15]" />
                </div>
              </div>
            </Card>

            <Card className="blueprint-card p-4 sm:p-6 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#64748B] text-xs sm:text-sm blueprint-label">Avg Accuracy</p>
                  <p className="text-2xl sm:text-3xl font-bold text-[#0F172A] mt-1 sm:mt-2">
                    {loading ? <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" /> : `${stats?.avg_accuracy_score || 0}%`}
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-12 sm:h-12 border-2 border-[#38BDF8] rounded-sm flex items-center justify-center">
                  <Activity className="w-4 h-4 sm:w-6 sm:h-6 text-[#38BDF8]" />
                </div>
              </div>
            </Card>

            <Card className="blueprint-card p-4 sm:p-6 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#64748B] text-xs sm:text-sm blueprint-label">Vector Chunks</p>
                  <p className="text-2xl sm:text-3xl font-bold text-[#0F172A] mt-1 sm:mt-2">
                    {loading ? <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" /> : (stats?.total_chunks || 0).toLocaleString()}
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-12 sm:h-12 border-2 border-[#1E3A8A] rounded-sm flex items-center justify-center">
                  <Database className="w-4 h-4 sm:w-6 sm:h-6 text-[#1E3A8A]" />
                </div>
              </div>
            </Card>
          </div>

          {/* Two Column Layout - Responsive */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Recent Queries - Limited to 4 */}
            <Card className="blueprint-card p-4 sm:p-6 bg-white">
              <div className="flex items-center justify-between mb-4 sm:mb-6 flex-wrap gap-2">
                <h2 className="text-lg sm:text-xl font-semibold text-[#0F172A] flex items-center gap-2">
                  <div className="w-1 h-5 sm:h-6 bg-[#1E3A8A]"></div>
                  Recent Queries
                </h2>
                <Button
                  onClick={() => navigateTo("query")}
                  variant="ghost"
                  size="sm"
                  className="text-[#1E3A8A] hover:text-[#38BDF8] text-sm"
                >
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              <div className="space-y-3">
                {recentQueries.length > 0 ? (
                  recentQueries.map((query) => (
                    <div
                      key={query.id}
                      onClick={() => navigateTo(`query?repo=${query.repo}`)}
                      className="p-3 sm:p-4 border-2 border-[#E2E8F0] rounded-sm hover:border-[#38BDF8] transition-colors cursor-pointer"
                    >
                      <p className="text-[#0F172A] text-sm font-medium break-words">{query.query}</p>
                      <p className="text-xs text-[#64748B] mt-1">Repo: {query.repo}</p>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2">
                        <span className="text-[#64748B] text-xs flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {query.time}
                        </span>
                        <span className="text-[#38BDF8] text-xs flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Answered
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center border-2 border-dashed border-[#E2E8F0] rounded-sm text-[#64748B]">
                    No recent queries found.
                  </div>
                )}
              </div>
            </Card>

            {/* Active Repositories - Limited to 4 */}
            <Card className="blueprint-card p-4 sm:p-6 bg-white">
              <div className="flex items-center justify-between mb-4 sm:mb-6 flex-wrap gap-2">
                <h2 className="text-lg sm:text-xl font-semibold text-[#0F172A] flex items-center gap-2">
                  <div className="w-1 h-5 sm:h-6 bg-[#1E3A8A]"></div>
                  Active Repositories
                </h2>
                <Button
                  onClick={() => navigateTo("datasources")}
                  variant="ghost"
                  size="sm"
                  className="text-[#1E3A8A] hover:text-[#38BDF8] text-sm"
                >
                  Manage
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              <div className="space-y-3">
                {activeRepos.length > 0 ? (
                  activeRepos.map((repo, idx) => (
                    <div key={idx} className="p-3 sm:p-4 border-2 border-[#E2E8F0] rounded-sm hover:border-[#1E3A8A] transition-colors group">
                      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-sm bg-[#F1F5FF] flex items-center justify-center text-[#1E3A8A] flex-shrink-0">
                            <Database className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[#0F172A] font-bold text-sm truncate max-w-[150px] sm:max-w-[200px]">{repo.repo_name}</p>
                            <span className="text-[#64748B] text-[10px] uppercase tracking-wider">
                              {repo.has_branch_index ? "Multi-Branch" : "Standard"} Index
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[#0F172A] font-bold text-sm">{repo.chunks.toLocaleString()}</p>
                          <p className="text-[10px] text-[#64748B] uppercase">Chunks</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-[#E2E8F0]">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B]">
                            {repo.language || "Unknown"}
                          </span>
                          <button
                            onClick={() => navigateTo(`query?repo=${repo.repo_name}`)}
                            className="flex items-center gap-1 text-[10px] font-bold text-[#1E3A8A] hover:text-[#38BDF8] transition-colors"
                          >
                            <MessageSquare className="w-3 h-3" />
                            Chat
                          </button>
                        </div>
                        <span className="text-[#64748B] text-[10px] blueprint-label">
                          Indexed {new Date(repo.indexed_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center border-2 border-dashed border-[#E2E8F0] rounded-sm text-[#64748B]">
                    No repositories indexed yet.
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Quick Actions - Only 3 buttons */}
          <Card className="blueprint-card p-4 sm:p-6 bg-white">
            <h2 className="text-lg sm:text-xl font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
              <div className="w-1 h-5 sm:h-6 bg-[#1E3A8A]"></div>
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <Button
                onClick={() => navigateTo("query")}
                className="bg-[#1E3A8A] hover:bg-[#38BDF8] text-white h-auto py-4 sm:py-6 flex flex-col gap-2 border-2 border-[#1E3A8A] hover:border-[#38BDF8] transition-all text-sm sm:text-base"
              >
                <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
                <span>New Query</span>
              </Button>
              <Button
                onClick={() => navigateTo("datasources")}
                variant="outline"
                className="border-2 border-[#1E3A8A] text-[#1E3A8A] hover:bg-[#F8FAFC] h-auto py-4 sm:py-6 flex flex-col gap-2 text-sm sm:text-base"
              >
                <GitCommit className="w-5 h-5 sm:w-6 sm:h-6" />
                <span>Sync Data</span>
              </Button>
              <Button
                onClick={() => navigateTo("analytics")}
                variant="outline"
                className="border-2 border-[#1E3A8A] text-[#1E3A8A] hover:bg-[#F8FAFC] h-auto py-4 sm:py-6 flex flex-col gap-2 text-sm sm:text-base"
              >
                <Activity className="w-5 h-5 sm:w-6 sm:h-6" />
                <span>View Analytics</span>
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}