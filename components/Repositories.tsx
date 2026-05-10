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
  RefreshCw,
  Search,
  Globe,
  User,
  Loader2,
  Plus,
  ExternalLink
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
  const [activeTab, setActiveTab] = useState("your-repos");

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
        setConversations(convsData.conversations.slice(0, 4));
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
        // Poll for yourRepos
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

        // Poll for publicRepos
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

  const yourRepos = repos;
  const publicRepos = indexedRepos.filter(ir => !repos.some(r => r.full_name === ir.full_name));

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

          {/* Your Repositories Section */}
          <Tabs defaultValue="your-repos" className="w-full" onValueChange={setActiveTab}>
            <Card className="blueprint-card p-6 bg-white">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-1 h-6 bg-[#1E3A8A]"></div>
                  <TabsList className="bg-[#F8FAFC] border-2 border-[#E2E8F0] p-1 h-auto">
                    <TabsTrigger 
                      value="your-repos" 
                      className="px-4 py-2 text-sm font-bold data-[state=active]:bg-[#1E3A8A] data-[state=active]:text-white transition-all flex items-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      Your Repositories
                    </TabsTrigger>
                    <TabsTrigger 
                      value="public-repos"
                      className="px-4 py-2 text-sm font-bold data-[state=active]:bg-[#1E3A8A] data-[state=active]:text-white transition-all flex items-center gap-2"
                    >
                      <Globe className="w-4 h-4" />
                      Public Ingested Repos
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                    <input
                      type="text"
                      placeholder={`Filter ${activeTab === 'your-repos' ? 'your' : 'public'} repos...`}
                      value={repoSearch}
                      onChange={(e) => setRepoSearch(e.target.value)}
                      className="pl-9 pr-4 py-2 border-2 border-[#E2E8F0] rounded-sm text-sm focus:border-[#1E3A8A] outline-none transition-colors w-64"
                    />
                  </div>
                </div>
              </div>

              <TabsContent value="your-repos" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {yourRepos
                    .filter(r => r.name.toLowerCase().includes(repoSearch.toLowerCase()))
                    .map((repo) => (
                    <div key={repo.id} className="p-4 border-2 border-[#E2E8F0] rounded-sm hover:border-[#1E3A8A] transition-all group relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-[#F8FAFC] rotate-45 translate-x-8 -translate-y-8 group-hover:bg-[#1E3A8A] transition-colors"></div>
                      
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-[#F1F5FF] rounded-sm text-[#1E3A8A] group-hover:bg-[#1E3A8A] group-hover:text-white transition-colors">
                            <Database className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="text-[#0F172A] font-bold text-sm truncate max-w-[150px]">{repo.name}</h3>
                            <p className="text-[#64748B] text-[10px] uppercase tracking-wider">{repo.language || "Unknown Language"}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <a 
                          href={repo.html_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-[#38BDF8] hover:underline flex items-center gap-1 truncate"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {repo.html_url}
                        </a>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-[#F1F5F9]">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            repo.indexing_status === 'completed' ? "bg-green-500" : 
                            (repo.indexing_status === 'indexing' || repo.indexing_status === 'pending') ? "bg-blue-400 animate-pulse" : 
                            repo.indexing_status === 'failed' ? "bg-red-500" : "bg-gray-300"
                          }`}></span>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-tighter">
                              {repo.indexing_status === 'completed' ? "Ready" : 
                               (repo.indexing_status === 'indexing' || repo.indexing_status === 'pending') ? "Indexing..." :
                               repo.indexing_status === 'failed' ? "Failed" : "Not Ingested"}
                            </span>
                            {repo.indexing_status === 'completed' && repo.indexed_at && (
                              <span className="text-[8px] text-[#94A3B8] font-medium leading-none">
                                {new Date(repo.indexed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {repo.indexing_status === 'completed' ? (
                          <Button
                            size="sm"
                            onClick={() => navigateTo(`query?repo=${repo.name}`)}
                            className="bg-[#1E3A8A] hover:bg-[#38BDF8] text-white text-[10px] font-bold h-7 px-3 rounded-sm shadow-sm transition-all"
                          >
                            <MessageSquare className="w-3 h-3 mr-1" />
                            Chat
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={repo.indexing_status === 'indexing' || repo.indexing_status === 'pending'}
                            onClick={() => navigateTo("datasources")}
                            className="text-[#1E3A8A] hover:text-[#38BDF8] text-[10px] font-bold h-7 px-3 blueprint-underline disabled:opacity-50"
                          >
                            { (repo.indexing_status === 'indexing' || repo.indexing_status === 'pending') ? (
                              <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                            ) : null }
                            { (repo.indexing_status === 'indexing' || repo.indexing_status === 'pending') ? "Processing" : "Ingest" }
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {yourRepos.length === 0 && !loading && (
                    <div className="col-span-full py-12 text-center border-2 border-dashed border-[#E2E8F0] rounded-sm">
                      <p className="text-[#64748B]">No personal repositories discovered.</p>
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

              <TabsContent value="public-repos" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {publicRepos
                    .filter(r => r.repo_name.toLowerCase().includes(repoSearch.toLowerCase()))
                    .map((repo) => (
                    <div key={repo.id} className="p-4 border-2 border-[#E2E8F0] rounded-sm hover:border-[#1E3A8A] transition-all group relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-[#F8FAFC] rotate-45 translate-x-8 -translate-y-8 group-hover:bg-[#1E3A8A] transition-colors"></div>
                      
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-[#F1F5FF] rounded-sm text-[#1E3A8A] group-hover:bg-[#1E3A8A] group-hover:text-white transition-colors">
                            <Globe className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="text-[#0F172A] font-bold text-sm truncate max-w-[150px]">{repo.repo_name}</h3>
                            <p className="text-[#64748B] text-[10px] uppercase tracking-wider">{repo.language || "Unknown Language"}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <a 
                          href={repo.repo_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-[#38BDF8] hover:underline flex items-center gap-1 truncate"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {repo.repo_url}
                        </a>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-[#F1F5F9]">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            repo.status === 'completed' ? "bg-green-500" : 
                            (repo.status === 'indexing' || repo.status === 'pending') ? "bg-blue-400 animate-pulse" : 
                            repo.status === 'failed' ? "bg-red-500" : "bg-gray-300"
                          }`}></span>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-tighter">
                              {repo.status === 'completed' ? "Ready" : 
                               (repo.status === 'indexing' || repo.status === 'pending') ? "Indexing..." :
                               repo.status === 'failed' ? "Failed" : "Ingesting"}
                            </span>
                            {repo.status === 'completed' && repo.indexed_at && (
                              <span className="text-[8px] text-[#94A3B8] font-medium leading-none">
                                {new Date(repo.indexed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {repo.status === 'completed' ? (
                          <Button
                            size="sm"
                            onClick={() => navigateTo(`query?repo=${repo.repo_name}`)}
                            className="bg-[#1E3A8A] hover:bg-[#38BDF8] text-white text-[10px] font-bold h-7 px-3 rounded-sm shadow-sm transition-all"
                          >
                            <MessageSquare className="w-3 h-3 mr-1" />
                            Chat
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={repo.status === 'indexing' || repo.status === 'pending'}
                            onClick={() => navigateTo("datasources")}
                            className="text-[#1E3A8A] hover:text-[#38BDF8] text-[10px] font-bold h-7 px-3 blueprint-underline disabled:opacity-50"
                          >
                            {(repo.status === 'indexing' || repo.status === 'pending') && <RefreshCw className="w-3 h-3 animate-spin mr-1" />}
                            {(repo.status === 'indexing' || repo.status === 'pending') ? "Processing" : "Manage"}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {publicRepos.length === 0 && !loading && (
                    <div className="col-span-full py-12 text-center border-2 border-dashed border-[#E2E8F0] rounded-sm">
                      <p className="text-[#64748B]">No public ingested repositories found.</p>
                      <Button 
                        onClick={() => navigateTo("datasources")}
                        variant="link" 
                        className="text-[#1E3A8A] mt-2"
                      >
                        Ingest a public repository
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Card>
          </Tabs>

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
