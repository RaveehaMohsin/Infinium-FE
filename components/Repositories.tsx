"use client";
import { useEffect, useState } from "react";
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
  Database,
  Loader2
} from "lucide-react";
import { reposApi, queryApi, ApiError, GithubRepo, Conversation } from "@/lib/api";

interface RepositoriesProps {
  navigateTo: (page: string) => void;
}

export function Repositories({ navigateTo }: RepositoriesProps) {
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [reposData, convsData] = await Promise.all([
          reposApi.listAllRepos(),
          queryApi.listConversations()
        ]);
        setRepos(reposData.repositories);
        setConversations(convsData.conversations.slice(0, 4));
      } catch (err) {
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const recentQueries = conversations.map(c => ({
    id: c.id,
    query: c.title || "Untitled Conversation",
    time: new Date(c.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: "answered"
  }));

  const githubReposCount = repos.length;
  const syncedReposCount = repos.filter(r => r.is_indexed).length;

  const knowledgeSources = [
    { name: "GitHub Repositories", count: githubReposCount, status: "synced", lastSync: "Live", color: "#1E3A8A" },
    { name: "CI/CD Logs", count: 0, status: "coming soon", lastSync: "—", color: "#38BDF8" },
    { name: "Documentation", count: syncedReposCount, status: "synced", lastSync: "Live", color: "#FACC15" },
    { name: "Error Reports (Sentry)", count: 0, status: "coming soon", lastSync: "—", color: "#64748B" },
  ];

  return (
    <div className="flex h-screen bg-white blueprint-bg">
      <Sidebar currentPage="repositories" navigateTo={navigateTo} />

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b-2 border-[#1E3A8A] px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-[#38BDF8]"></div>
            <div>
              <h1 className="text-3xl font-bold text-[#0F172A]">Repositories</h1>
              <p className="text-[#64748B] mt-1">Manage your code repositories</p>
            </div>
          </div>
        </header>

        <div className="p-8 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-6">
            <Card className="blueprint-card p-6 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-[#64748B] text-sm blueprint-label">GitHub Repos</p>
                  <p className="text-3xl font-bold text-[#0F172A] mt-2">
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : githubReposCount}
                  </p>
                  <p className="text-[#38BDF8] text-sm mt-2 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" strokeWidth={1.5} />
                    <span>Total discovered</span>
                  </p>
                </div>
                <div className="w-12 h-12 border-2 border-[#1E3A8A] rounded-sm flex items-center justify-center">
                  <Database className="w-6 h-6 text-[#1E3A8A]" strokeWidth={1.5} />
                </div>
              </div>
            </Card>

            <Card className="blueprint-card p-6 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-[#64748B] text-sm blueprint-label">Synced Repos</p>
                  <p className="text-3xl font-bold text-[#0F172A] mt-2">
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : syncedReposCount}
                  </p>
                  <p className="text-[#FACC15] text-sm mt-2 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" strokeWidth={1.5} />
                    <span>Ready for reasoning</span>
                  </p>
                </div>
                <div className="w-12 h-12 border-2 border-[#FACC15] rounded-sm flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-[#FACC15]" strokeWidth={1.5} />
                </div>
              </div>
            </Card>

            <Card className="blueprint-card p-6 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-[#64748B] text-sm blueprint-label">Vector Snippets</p>
                  <p className="text-3xl font-bold text-[#0F172A] mt-2">
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : repos.reduce((acc, r) => acc + (r.chunks_count || 0), 0).toLocaleString()}
                  </p>
                  <p className="text-[#38BDF8] text-sm mt-2 flex items-center gap-1">
                    <FileText className="w-4 h-4" strokeWidth={1.5} />
                    <span>Atomic knowledge</span>
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
                  <p className="text-[#64748B] text-sm blueprint-label">Last Activity</p>
                  <p className="text-xl font-bold text-[#0F172A] mt-2">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Just now"}
                  </p>
                  <p className="text-[#EF4444] text-sm mt-2 flex items-center gap-1">
                    <Clock className="w-4 h-4" strokeWidth={1.5} />
                    <span>System online</span>
                  </p>
                </div>
                <div className="w-12 h-12 border-2 border-[#EF4444] rounded-sm flex items-center justify-center">
                  <Activity className="w-6 h-6 text-[#EF4444]" strokeWidth={1.5} />
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
                {recentQueries.map((query) => (
                  <div key={query.id} className="p-4 border-2 border-[#E2E8F0] rounded-sm hover:border-[#38BDF8] transition-colors blueprint-highlight cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-[#0F172A] text-sm">{query.query}</p>
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
                ))}
              </div>
            </Card>

            {/* Knowledge Sources */}
            <Card className="blueprint-card p-6 bg-white">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-[#0F172A] flex items-center gap-2">
                  <div className="w-1 h-6 bg-[#1E3A8A]"></div>
                  Knowledge Sources
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
                {knowledgeSources.map((source, idx) => (
                  <div key={idx} className="p-4 border-2 border-[#E2E8F0] rounded-sm hover:border-[#1E3A8A] transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: source.color }}></div>
                        <span className="text-[#0F172A] font-medium text-sm">{source.name}</span>
                      </div>
                      <span className="text-[#64748B] text-sm">{source.count} items</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-1 rounded-sm border ${source.status === 'synced'
                          ? 'border-[#FACC15] text-[#FACC15]'
                          : 'border-[#38BDF8] text-[#38BDF8]'
                        }`}>
                        {source.status}
                      </span>
                      <span className="text-[#64748B] text-xs blueprint-label">{source.lastSync}</span>
                    </div>
                  </div>
                ))}
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

          {/* VSCode Extension Download */}
          <Card className="blueprint-card p-8 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.15 2.587L18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 0 0-1.276.057L.327 7.261A1 1 0 0 0 .326 8.74L3.899 12 .326 15.26a1 1 0 0 0 .001 1.479L1.65 17.94a.999.999 0 0 0 1.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 0 0 1.704.29l4.942-2.377A1.5 1.5 0 0 0 24 20.06V3.939a1.5 1.5 0 0 0-.85-1.352zm-5.146 14.861L10.826 12l7.178-5.448v10.896z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">VSCode Extension</h3>
                    <p className="text-sm text-gray-600">Get contextual insights directly in your IDE</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  Access Infinium's reasoning capabilities without leaving your development environment.
                  Query your codebase, view decision history, and get AI-powered suggestions inline.
                </p>
                <div className="flex items-center gap-4">
                  <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Extension
                  </Button>
                  <Button variant="outline" className="border-2 border-blue-300 text-blue-700 hover:bg-blue-100 px-6 py-3 rounded-xl">
                    View Documentation
                  </Button>
                </div>
              </div>
              <div className="hidden lg:block ml-8">
                <div className="w-48 h-48 bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-200">
                  <div className="flex flex-col items-center justify-center h-full">
                    <svg className="w-20 h-20 text-blue-600 mb-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.15 2.587L18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 0 0-1.276.057L.327 7.261A1 1 0 0 0 .326 8.74L3.899 12 .326 15.26a1 1 0 0 0 .001 1.479L1.65 17.94a.999.999 0 0 0 1.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 0 0 1.704.29l4.942-2.377A1.5 1.5 0 0 0 24 20.06V3.939a1.5 1.5 0 0 0-.85-1.352zm-5.146 14.861L10.826 12l7.178-5.448v10.896z" />
                    </svg>
                    <p className="text-sm font-semibold text-gray-700">Infinium</p>
                    <p className="text-xs text-gray-500">v1.0.0</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
