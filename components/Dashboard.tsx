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
} from "lucide-react";
import { useEffect, useState } from "react";
import { dashboardApi, ApiError } from "@/lib/api";
import type { DashboardStats } from "@/lib/api/types";

interface DashboardProps {
  navigateTo: (page: string) => void;
}

export function Dashboard({ navigateTo }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    loadStats();
  }, []);

  const recentQueries = stats?.recent_activity?.recent_queries?.map((q, i) => ({
    id: i,
    query: q.question,
    time: new Date(q.asked_at).toLocaleDateString() + " " + new Date(q.asked_at).toLocaleTimeString(),
    status: "answered",
    repo: q.repo_name
  })) || [];

  return (
    <div className="flex h-screen bg-white blueprint-bg">
      <Sidebar currentPage="dashboard" navigateTo={navigateTo} />

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b-2 border-[#1E3A8A] px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-[#38BDF8]"></div>
            <div>
              <h1 className="text-3xl font-bold text-[#0F172A]">Dashboard</h1>
              <p className="text-[#64748B] mt-1">Monitor your knowledge intelligence system</p>
            </div>
          </div>
        </header>
        <div className="p-8 space-y-6">
          {error && (
            <div className="rounded-md border-2 border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-6">
            <Card className="blueprint-card p-6 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-[#64748B] text-sm blueprint-label">Indexed Repos</p>
                  <p className="text-3xl font-bold text-[#0F172A] mt-2">
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : stats?.repositories_indexed || 0}
                  </p>
                  <p className="text-[#38BDF8] text-sm mt-2 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" strokeWidth={1.5} />
                    <span>Total codebases</span>
                  </p>
                </div>
                <div className="w-12 h-12 border-2 border-[#1E3A8A] rounded-sm flex items-center justify-center">
                  <GitCommit className="w-6 h-6 text-[#1E3A8A]" strokeWidth={1.5} />
                </div>
              </div>
            </Card>

            <Card className="blueprint-card p-6 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-[#64748B] text-sm blueprint-label">Total Queries</p>
                  <p className="text-3xl font-bold text-[#0F172A] mt-2">
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : stats?.total_queries || 0}
                  </p>
                  <p className="text-[#FACC15] text-sm mt-2 flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" strokeWidth={1.5} />
                    <span>User interactions</span>
                  </p>
                </div>
                <div className="w-12 h-12 border-2 border-[#FACC15] rounded-sm flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-[#FACC15]" strokeWidth={1.5} />
                </div>
              </div>
            </Card>

            <Card className="blueprint-card p-6 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-[#64748B] text-sm blueprint-label">Avg Accuracy</p>
                  <p className="text-3xl font-bold text-[#0F172A] mt-2">
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : `${(stats?.avg_accuracy_score || 0).toFixed(1)}%`}
                  </p>
                  <p className="text-[#38BDF8] text-sm mt-2 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" strokeWidth={1.5} />
                    <span>System confidence</span>
                  </p>
                </div>
                <div className="w-12 h-12 border-2 border-[#38BDF8] rounded-sm flex items-center justify-center">
                  <Activity className="w-6 h-6 text-[#38BDF8]" strokeWidth={1.5} />
                </div>
              </div>
            </Card>

            <Card className="blueprint-card p-6 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-[#64748B] text-sm blueprint-label">Vector Chunks</p>
                  <p className="text-3xl font-bold text-[#0F172A] mt-2">
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (stats?.total_chunks || 0).toLocaleString()}
                  </p>
                  <p className="text-[#38BDF8] text-sm mt-2 flex items-center gap-1">
                    <FileText className="w-4 h-4" strokeWidth={1.5} />
                    <span>Indexed snippets</span>
                  </p>
                </div>
                <div className="w-12 h-12 border-2 border-[#1E3A8A] rounded-sm flex items-center justify-center">
                  <Database className="w-6 h-6 text-[#1E3A8A]" strokeWidth={1.5} />
                </div>
              </div>
            </Card>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-2 gap-6">
            {/* Recent Queries */}
            <Card className="blueprint-card p-6 bg-white">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-[#0F172A] flex items-center gap-2">
                  <div className="w-1 h-6 bg-[#1E3A8A]"></div>
                  Recent Queries
                </h2>
                <Button
                  onClick={() => navigateTo("query")}
                  variant="ghost"
                  size="sm"
                  className="text-[#1E3A8A] hover:text-[#38BDF8] blueprint-underline"
                >
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" strokeWidth={1.5} />
                </Button>
              </div>
              <div className="space-y-3">
                {recentQueries.length > 0 ? (
                  recentQueries.map((query) => (
                    <div key={query.id} className="p-4 border-2 border-[#E2E8F0] rounded-sm hover:border-[#38BDF8] transition-colors blueprint-highlight cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-[#0F172A] text-sm font-medium">{query.query}</p>
                          <p className="text-xs text-[#64748B] mt-1">Repo: {query.repo}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-[#64748B] text-xs flex items-center gap-1">
                              <Clock className="w-3 h-3" strokeWidth={1.5} />
                              {query.time}
                            </span>
                            <span className="text-[#38BDF8] text-xs flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" strokeWidth={1.5} />
                              Answered
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center border-2 border-dashed border-[#E2E8F0] rounded-sm text-[#64748B]">
                    No recent queries found. Start by asking a question!
                  </div>
                )}
              </div>
            </Card>

            {/* Recently Indexed Repos */}
            <Card className="blueprint-card p-6 bg-white">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-[#0F172A] flex items-center gap-2">
                  <div className="w-1 h-6 bg-[#1E3A8A]"></div>
                  Active Repositories
                </h2>
                <Button
                  onClick={() => navigateTo("datasources")}
                  variant="ghost"
                  size="sm"
                  className="text-[#1E3A8A] hover:text-[#38BDF8] blueprint-underline"
                >
                  Manage
                  <ArrowRight className="w-4 h-4 ml-2" strokeWidth={1.5} />
                </Button>
              </div>
              <div className="space-y-3">
                {stats?.recent_activity?.recently_indexed?.length ? (
                  stats.recent_activity.recently_indexed.map((repo, idx) => (
                    <div key={idx} className="p-4 border-2 border-[#E2E8F0] rounded-sm hover:border-[#1E3A8A] transition-colors group">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-sm bg-[#F1F5FF] flex items-center justify-center text-[#1E3A8A] group-hover:bg-[#1E3A8A] group-hover:text-white transition-colors">
                            <Database className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[#0F172A] font-bold text-sm">{repo.repo_name}</span>
                            <span className="text-[#64748B] text-[10px] uppercase tracking-wider">{repo.has_branch_index ? "Multi-Branch" : "Standard"} Index</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[#0F172A] font-bold text-xs">{repo.chunks}</span>
                          <p className="text-[10px] text-[#64748B] uppercase">Chunks</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#E2E8F0]">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B]">
                          {repo.language || "Unknown"}
                        </span>
                        <span className="text-[#64748B] text-[10px] blueprint-label">
                          Indexed {new Date(repo.indexed_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center border-2 border-dashed border-[#E2E8F0] rounded-sm text-[#64748B]">
                    No repositories indexed yet.
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="blueprint-card p-6 bg-white">
            <h2 className="text-xl font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-[#1E3A8A]"></div>
              Quick Actions
            </h2>
            <div className="grid grid-cols-4 gap-4">
              <Button
                onClick={() => navigateTo("query")}
                className="bg-[#1E3A8A] hover:bg-[#38BDF8] text-white h-auto py-6 flex-col gap-2 border-2 border-[#1E3A8A] hover:border-[#38BDF8] transition-all"
              >
                <MessageSquare className="w-6 h-6" strokeWidth={1.5} />
                <span>New Query</span>
              </Button>
              <Button
                onClick={() => navigateTo("datasources")}
                variant="outline"
                className="border-2 border-[#1E3A8A] text-[#1E3A8A] hover:bg-[#F8FAFC] h-auto py-6 flex-col gap-2 blueprint-highlight"
              >
                <GitCommit className="w-6 h-6" strokeWidth={1.5} />
                <span>Sync Data</span>
              </Button>
              <Button
                onClick={() => navigateTo("analytics")}
                variant="outline"
                className="border-2 border-[#1E3A8A] text-[#1E3A8A] hover:bg-[#F8FAFC] h-auto py-6 flex-col gap-2 blueprint-highlight"
              >
                <Activity className="w-6 h-6" strokeWidth={1.5} />
                <span>View Analytics</span>
              </Button>
              <Button
                onClick={() => navigateTo("integrations")}
                variant="outline"
                className="border-2 border-[#1E3A8A] text-[#1E3A8A] hover:bg-[#F8FAFC] h-auto py-6 flex-col gap-2 blueprint-highlight"
              >
                <Activity className="w-6 h-6" strokeWidth={1.5} />
                <span>Add Integration</span>
              </Button>
            </div>
          </Card>

          {/* Removed promotional content to focus on functionality */}
        </div>
      </main>
    </div>
  );
}
