"use client";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  GitCommit,
  FileText,
  Activity,
  ArrowRight,
  Database,
  RefreshCw,
  Search,
  Calendar,
  Loader2,
  Plus,
  ExternalLink,
  FolderOpen
} from "lucide-react";
import { reposApi, queryApi, ApiError, GithubRepo, IndexedRepository, Conversation, ingestApi, branchIngestApi } from "@/lib/api";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface RepositoriesProps {
  navigateTo: (page: string) => void;
}

export function Repositories({ navigateTo }: RepositoriesProps) {
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [indexedRepos, setIndexedRepos] = useState<IndexedRepository[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [repoSearch, setRepoSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all-repos");

  useEffect(() => {
    async function loadData() {
      try {
        const [reposData, indexedData, convsData] = await Promise.all([
          reposApi.listAllRepos(),
          reposApi.listIndexedRepos(),
          queryApi.listConversations()
        ]);
        setRepos(reposData.repositories);
        setIndexedRepos(indexedData.repositories);
        setConversations(convsData.conversations);
      } catch (err) {
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Poll status for any repo currently indexing
  useEffect(() => {
    const indexingRepos = repos.filter((r) => r.indexing_status === "indexing" || r.indexing_status === "pending");
    const indexingPublic = indexedRepos.filter((r) => r.status === "indexing" || r.status === "pending");

    if (indexingRepos.length === 0 && indexingPublic.length === 0) return;

    const interval = setInterval(async () => {
      try {
        if (indexingRepos.length > 0) {
          const updates = await Promise.all(
            indexingRepos.map(async (r) => {
              const [std, br] = await Promise.allSettled([
                ingestApi.getIngestionStatus(r.name),
                branchIngestApi.getBranchIngestionStatus(r.name)
              ]);
              const stdStatus = std.status === 'fulfilled' ? std.value : null;
              const brStatus = br.status === 'fulfilled' ? br.value : null;
              if (brStatus && brStatus.status !== 'failed' && brStatus.status !== null) {
                return { name: r.name, status: brStatus, isBranch: true };
              }
              return stdStatus ? { name: r.name, status: stdStatus, isBranch: false } : null;
            })
          );
          setRepos((prev) =>
            prev.map((repo) => {
              const update = updates.find((u) => u && u.name === repo.name);
              if (!update) return repo;
              const isCompleted = update.status.status === "completed";
              return {
                ...repo,
                indexing_status: update.status.status,
                is_indexed: isCompleted || (repo.is_indexed && update.status.status !== 'failed'),
              };
            })
          );
        }

        if (indexingPublic.length > 0) {
          const updates = await Promise.all(
            indexingPublic.map(async (r) => {
              const [std, br] = await Promise.allSettled([
                ingestApi.getIngestionStatus(r.repo_name),
                branchIngestApi.getBranchIngestionStatus(r.repo_name)
              ]);
              const stdStatus = std.status === 'fulfilled' ? std.value : null;
              const brStatus = br.status === 'fulfilled' ? br.value : null;
              if (brStatus && brStatus.status !== 'failed' && brStatus.status !== null) {
                return { name: r.repo_name, status: brStatus, isBranch: true };
              }
              return stdStatus ? { name: r.repo_name, status: stdStatus, isBranch: false } : null;
            })
          );
          setIndexedRepos((prev) =>
            prev.map((repo) => {
              const update = updates.find((u) => u && u.name === repo.repo_name);
              if (!update) return repo;
              return {
                ...repo,
                status: (update.status.status as any) || repo.status,
                indexed_at: update.status.indexed_at ?? repo.indexed_at,
              };
            })
          );
        }
      } catch (err) {
        console.warn("Polling error in Repositories:", err);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [repos, indexedRepos]);

  // All repos = GitHub repos (for GitHub users) + manually ingested public repos
  const allRepos = [...repos, ...indexedRepos.filter(ir => !repos.some(r => r.full_name === ir.full_name))];

  // Ingested repos = only those with status 'completed'
  const ingestedRepos = allRepos.filter(r => {
    if ('status' in r) {
      // This is an IndexedRepository
      return r.status === 'completed';
    } else {
      // This is a GithubRepo
      return r.is_indexed === true;
    }
  });

  const recentQueries = conversations.slice(0, 5).map(c => ({
    id: c.id,
    query: c.title || "Untitled Conversation",
    time: new Date(c.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    date: new Date(c.updated_at).toLocaleDateString(),
    status: "answered",
    color: "#1E3A8A"
  }));

  const githubReposCount = repos.length;
  const syncedReposCount = ingestedRepos.length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'indexing': return 'bg-blue-400 animate-pulse';
      case 'pending': return 'bg-yellow-400 animate-pulse';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Ready';
      case 'indexing': return 'Indexing...';
      case 'pending': return 'Pending...';
      case 'failed': return 'Failed';
      default: return 'Not Ingested';
    }
  };

  return (
    <div className="flex h-screen bg-white blueprint-bg overflow-hidden">
      <Sidebar currentPage="repositories" navigateTo={navigateTo} />

      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b-2 border-[#1E3A8A] px-4 sm:px-8 py-4 sm:py-6 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 sm:h-8 bg-[#38BDF8]"></div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">Repositories</h1>
              <p className="text-sm text-[#64748B] mt-1 hidden sm:block">Manage your code repositories</p>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-8 space-y-4 sm:space-y-6">
          {error && (
            <div className="rounded-md border-2 border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Stats Grid - Responsive */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <Card className="blueprint-card p-4 sm:p-6 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-[#64748B] text-xs sm:text-sm blueprint-label">Total Repos</p>
                  <p className="text-2xl sm:text-3xl font-bold text-[#0F172A] mt-1 sm:mt-2">
                    {loading ? <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" /> : allRepos.length}
                  </p>
                  <p className="text-[#38BDF8] text-xs sm:text-sm mt-2 flex items-center gap-1">
                    <FolderOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>All repositories</span>
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-12 sm:h-12 border-2 border-[#1E3A8A] rounded-sm flex items-center justify-center">
                  <Database className="w-4 h-4 sm:w-6 sm:h-6 text-[#1E3A8A]" />
                </div>
              </div>
            </Card>

            <Card className="blueprint-card p-4 sm:p-6 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-[#64748B] text-xs sm:text-sm blueprint-label">Ingested Repos</p>
                  <p className="text-2xl sm:text-3xl font-bold text-[#0F172A] mt-1 sm:mt-2">
                    {loading ? <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" /> : syncedReposCount}
                  </p>
                  <p className="text-[#FACC15] text-xs sm:text-sm mt-2 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Ready for reasoning</span>
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-12 sm:h-12 border-2 border-[#FACC15] rounded-sm flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6 text-[#FACC15]" />
                </div>
              </div>
            </Card>

            <Card className="blueprint-card p-4 sm:p-6 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-[#64748B] text-xs sm:text-sm blueprint-label">Vector Snippets</p>
                  <p className="text-2xl sm:text-3xl font-bold text-[#0F172A] mt-1 sm:mt-2">
                    {loading ? <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" /> : allRepos.reduce((acc, r) => acc + (r.chunks_count || 0), 0).toLocaleString()}
                  </p>
                  <p className="text-[#38BDF8] text-xs sm:text-sm mt-2 flex items-center gap-1">
                    <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Atomic knowledge</span>
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-12 sm:h-12 border-2 border-[#38BDF8] rounded-sm flex items-center justify-center">
                  <Activity className="w-4 h-4 sm:w-6 sm:h-6 text-[#38BDF8]" />
                </div>
              </div>
            </Card>

            <Card className="blueprint-card p-4 sm:p-6 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-[#64748B] text-xs sm:text-sm blueprint-label">GitHub Connected</p>
                  <p className="text-2xl sm:text-3xl font-bold text-[#0F172A] mt-1 sm:mt-2">
                    {loading ? <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" /> : githubReposCount}
                  </p>
                  <p className="text-[#EF4444] text-xs sm:text-sm mt-2 flex items-center gap-1">
                    <Activity className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Active connection</span>
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-12 sm:h-12 border-2 border-[#EF4444] rounded-sm flex items-center justify-center">
                  <Activity className="w-4 h-4 sm:w-6 sm:h-6 text-[#EF4444]" />
                </div>
              </div>
            </Card>
          </div>

          {/* Repositories Section */}
          <Tabs defaultValue="all-repos" className="w-full" onValueChange={setActiveTab}>
            <Card className="blueprint-card p-4 sm:p-6 bg-white">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 sm:mb-6 gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-1 h-6 bg-[#1E3A8A]"></div>
                  <TabsList className="bg-[#F8FAFC] border-2 border-[#E2E8F0] p-1 h-auto">
                    <TabsTrigger
                      value="all-repos"
                      className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold data-[state=active]:bg-[#1E3A8A] data-[state=active]:text-white transition-all flex items-center gap-2"
                    >
                      <FolderOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                      All Repositories
                    </TabsTrigger>
                    <TabsTrigger
                      value="ingested-repos"
                      className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold data-[state=active]:bg-[#1E3A8A] data-[state=active]:text-white transition-all flex items-center gap-2"
                    >
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                      Ingested Repos
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                  <input
                    type="text"
                    placeholder={`Filter ${activeTab === 'all-repos' ? 'all' : 'ingested'} repos...`}
                    value={repoSearch}
                    onChange={(e) => setRepoSearch(e.target.value)}
                    className="pl-9 pr-4 py-2 border-2 border-[#E2E8F0] rounded-sm text-sm focus:border-[#1E3A8A] outline-none transition-colors w-full md:w-64"
                  />
                </div>
              </div>

              <TabsContent value="all-repos" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {allRepos
                    .filter(r => {
                      const searchTerm = repoSearch.toLowerCase();
                      const repoName = 'repo_name' in r ? r.repo_name : r.name;
                      return repoName?.toLowerCase().includes(searchTerm);
                    })
                    .map((repo, idx) => {
                      const repoName = 'repo_name' in repo ? repo.repo_name : repo.name;
                      const repoUrl = 'repo_url' in repo ? repo.repo_url : repo.html_url;
                      const status = 'status' in repo ? repo.status : repo.indexing_status;
                      const isIndexed = 'status' in repo ? repo.status === 'completed' : repo.is_indexed;
                      const language = repo.language || null;
                      const indexedAt = 'indexed_at' in repo ? repo.indexed_at : null;

                      return (
                        <div key={idx} className="p-3 sm:p-4 border-2 border-[#E2E8F0] rounded-sm hover:border-[#1E3A8A] transition-all group relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-16 h-16 bg-[#F8FAFC] rotate-45 translate-x-8 -translate-y-8 group-hover:bg-[#1E3A8A] transition-colors"></div>

                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="p-2 bg-[#F1F5FF] rounded-sm text-[#1E3A8A] group-hover:bg-[#1E3A8A] group-hover:text-white transition-colors flex-shrink-0">
                                <Database className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <h3 className="text-[#0F172A] font-bold text-sm truncate max-w-[120px] sm:max-w-[150px]">{repoName}</h3>
                                <p className="text-[#64748B] text-[10px] uppercase tracking-wider">{language || "Unknown"}</p>
                              </div>
                            </div>
                          </div>

                          <div className="mb-4">
                            <a
                              href={repoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-[#38BDF8] hover:underline flex items-center gap-1 truncate"
                            >
                              <ExternalLink className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{repoUrl}</span>
                            </a>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-[#F1F5F9] flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${getStatusColor(status || '')}`}></span>
                              <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-tighter">
                                  {getStatusText(status || '')}
                                </span>
                                {isIndexed && indexedAt && (
                                  <span className="text-[8px] text-[#94A3B8] font-medium leading-none">
                                    {new Date(indexedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                )}
                              </div>
                            </div>

                            {isIndexed ? (
                              <Button
                                size="sm"
                                onClick={() => navigateTo(`query?repo=${repoName}`)}
                                className="bg-[#1E3A8A] hover:bg-[#38BDF8] text-white text-[10px] font-bold h-7 px-3 rounded-sm shadow-sm transition-all"
                              >
                                <MessageSquare className="w-3 h-3 mr-1" />
                                Chat
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled={status === 'indexing' || status === 'pending'}
                                onClick={() => navigateTo("datasources")}
                                className="text-[#1E3A8A] hover:text-[#38BDF8] text-[10px] font-bold h-7 px-3 disabled:opacity-50"
                              >
                                {(status === 'indexing' || status === 'pending') && <RefreshCw className="w-3 h-3 animate-spin mr-1" />}
                                {(status === 'indexing' || status === 'pending') ? "Processing" : "Ingest"}
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}

                  {allRepos.length === 0 && !loading && (
                    <div className="col-span-full py-12 text-center border-2 border-dashed border-[#E2E8F0] rounded-sm">
                      <p className="text-[#64748B]">No repositories found.</p>
                      <Button
                        onClick={() => navigateTo("datasources")}
                        variant="link"
                        className="text-[#1E3A8A] mt-2"
                      >
                        Connect your GitHub account
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="ingested-repos" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {ingestedRepos
                    .filter(r => {
                      const searchTerm = repoSearch.toLowerCase();
                      const repoName = 'repo_name' in r ? r.repo_name : r.name;
                      return repoName?.toLowerCase().includes(searchTerm);
                    })
                    .map((repo, idx) => {
                      const repoName = 'repo_name' in repo ? repo.repo_name : repo.name;
                      const repoUrl = 'repo_url' in repo ? repo.repo_url : repo.html_url;
                      const language = 'language' in repo ? repo.language : null;

                      return (
                        <div key={idx} className="p-3 sm:p-4 border-2 border-[#E2E8F0] rounded-sm hover:border-[#1E3A8A] transition-all group relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-16 h-16 bg-[#F8FAFC] rotate-45 translate-x-8 -translate-y-8 group-hover:bg-[#1E3A8A] transition-colors"></div>

                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="p-2 bg-[#F1F5FF] rounded-sm text-[#1E3A8A] group-hover:bg-[#1E3A8A] group-hover:text-white transition-colors flex-shrink-0">
                                <CheckCircle className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <h3 className="text-[#0F172A] font-bold text-sm truncate max-w-[120px] sm:max-w-[150px]">{repoName}</h3>
                                <p className="text-[#64748B] text-[10px] uppercase tracking-wider">{language || "Unknown"}</p>
                              </div>
                            </div>
                          </div>

                          <div className="mb-4">
                            <a
                              href={repoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-[#38BDF8] hover:underline flex items-center gap-1 truncate"
                            >
                              <ExternalLink className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{repoUrl}</span>
                            </a>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-[#F1F5F9]">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-green-500"></span>
                              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-tighter">Ready</span>
                            </div>

                            <Button
                              size="sm"
                              onClick={() => navigateTo(`query?repo=${repoName}`)}
                              className="bg-[#1E3A8A] hover:bg-[#38BDF8] text-white text-[10px] font-bold h-7 px-3 rounded-sm shadow-sm transition-all"
                            >
                              <MessageSquare className="w-3 h-3 mr-1" />
                              Chat
                            </Button>
                          </div>
                        </div>
                      );
                    })}

                  {ingestedRepos.length === 0 && !loading && (
                    <div className="col-span-full py-12 text-center border-2 border-dashed border-[#E2E8F0] rounded-sm">
                      <p className="text-[#64748B]">No ingested repositories found.</p>
                      <Button
                        onClick={() => navigateTo("datasources")}
                        variant="link"
                        className="text-[#1E3A8A] mt-2"
                      >
                        Ingest a repository
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Card>
          </Tabs>

          {/* Recent Queries Section - Replacing Knowledge Sources */}
          <Card className="blueprint-card p-4 sm:p-6 bg-white">
            <div className="flex items-center justify-between mb-4 sm:mb-6 flex-wrap gap-2">
              <h2 className="text-lg sm:text-xl font-semibold text-[#0F172A] flex items-center gap-2">
                <div className="w-1 h-5 sm:h-6 bg-[#1E3A8A]"></div>
                Recent Conversations
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
                    onClick={() => navigateTo(`query?conversation=${query.id}`)}
                    className="p-3 sm:p-4 border-2 border-[#E2E8F0] rounded-sm hover:border-[#38BDF8] transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start justify-between flex-wrap gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: query.color }}></div>
                          <p className="text-[#0F172A] text-sm font-medium truncate">{query.query}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-2">
                          <span className="text-[#64748B] text-xs flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {query.time}
                          </span>
                          <span className="text-[#64748B] text-xs flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {query.date}
                          </span>
                          <span className="text-[#38BDF8] text-xs flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            {query.status}
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-[#1E3A8A]"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center border-2 border-dashed border-[#E2E8F0] rounded-sm">
                  <p className="text-[#64748B]">No conversations yet.</p>
                  <Button
                    onClick={() => navigateTo("query")}
                    variant="link"
                    className="text-[#1E3A8A] mt-2"
                  >
                    Start a conversation
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}