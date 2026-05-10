"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import {
  GitBranch,
  Database,
  Activity,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  ExternalLink,
  Lock,
  Loader2,
  Star,
  Search,
  PlayCircle,
  MessageSquare,
  Globe,
  User as UserIcon
} from "lucide-react";
import {
  ApiError,
  GithubRepo,
  authApi,
  ingestApi,
  reposApi,
  branchIngestApi,
  type IndexedRepository
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface DataSourcesProps {
  navigateTo: (page: string) => void;
}

type RepoActionState = "idle" | "starting" | "deleting";

export function DataSources({ navigateTo }: DataSourcesProps) {
  const { user } = useAuth();
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [indexedRepos, setIndexedRepos] = useState<IndexedRepository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [actionState, setActionState] = useState<Record<string, RepoActionState>>({});
  const [feedback, setFeedback] = useState<{
    repoName: string;
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [manualUrl, setManualUrl] = useState("");
  const [isManualSubmitting, setIsManualSubmitting] = useState(false);
  const [manualDeepIndex, setManualDeepIndex] = useState(false);
  const [confirmRepo, setConfirmRepo] = useState<GithubRepo | null>(null);
  const [activeTab, setActiveTab] = useState("your-repos");

  const isGithubUser = user?.auth_provider === "github";

  const loadRepos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [allData, indexedData] = await Promise.all([
        reposApi.listAllRepos(),
        reposApi.listIndexedRepos()
      ]);
      setRepos(allData.repositories);
      setIndexedRepos(indexedData.repositories);
    } catch (err: any) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to load repositories";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isGithubUser) {
      loadRepos();
    } else {
      setLoading(false);
    }
  }, [isGithubUser, loadRepos]);

  // Poll status for any repo currently indexing
  useEffect(() => {
    const indexing = repos.filter((r) => r.indexing_status === "indexing");
    if (indexing.length === 0) return;

    const interval = setInterval(async () => {
      try {
        const updates = await Promise.all(
          indexing.map(async (r) => {
            const [std, br] = await Promise.allSettled([
              ingestApi.getIngestionStatus(r.name),
              branchIngestApi.getBranchIngestionStatus(r.name)
            ]);
            
            const stdStatus = std.status === 'fulfilled' ? std.value : null;
            const brStatus = br.status === 'fulfilled' ? br.value : null;
            
            if (brStatus && brStatus.status !== 'failed') {
              return { name: r.name, status: brStatus, isBranch: true };
            }
            return stdStatus ? { name: r.name, status: stdStatus, isBranch: false } : null;
          })
        );
        
        setRepos((prev) =>
          prev.map((repo) => {
            const update = updates.find((u) => u && u.name === repo.name);
            if (!update) return repo;
            const s = update.status;
            
            const branchesList = update.isBranch && 'branches_list' in s 
              ? (s as { branches_list: string[] }).branches_list 
              : repo.indexed_branches;

            // Only flip is_indexed to true when it's actually completed
            const isCompleted = s.status === "completed";

            return {
              ...repo,
              indexing_status: s.status,
              chunks_count: s.chunks_count ?? repo.chunks_count,
              indexed_at: s.indexed_at ?? repo.indexed_at,
              is_indexed: isCompleted || (repo.is_indexed && s.status !== 'failed'),
              has_branch_index: update.isBranch && isCompleted ? true : repo.has_branch_index,
              indexed_branches: branchesList
            };
          })
        );
      } catch (err) {
        console.warn("Polling error (possible timeout):", err);
        // Keep existing status if polling fails (likely a temporary backend timeout)
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [repos]);

  const filteredRepos = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return repos;
    return repos.filter(
      (repo) =>
        repo.name.toLowerCase().includes(q) ||
        repo.full_name.toLowerCase().includes(q) ||
        (repo.description?.toLowerCase().includes(q) ?? false)
    );
  }, [repos, search]);

  const publicRepos = useMemo(() => {
    return indexedRepos.filter(ir => !repos.some(r => r.full_name === ir.full_name));
  }, [indexedRepos, repos]);

  const filteredPublicRepos = useMemo(() => {
    const q = search.toLowerCase();
    return publicRepos.filter(
      (repo) =>
        repo.repo_name.toLowerCase().includes(q) ||
        repo.full_name.toLowerCase().includes(q)
    );
  }, [publicRepos, search]);

  const indexedCount = useMemo(
    () => repos.filter((r) => r.is_indexed).length,
    [repos]
  );
  const totalChunks = useMemo(
    () => repos.reduce((sum, r) => sum + (r.chunks_count || 0), 0),
    [repos]
  );

  const setRepoAction = (repoName: string, state: RepoActionState) => {
    setActionState((prev) => ({ ...prev, [repoName]: state }));
  };

  const handleStartIngestion = async (repo: GithubRepo) => {
    setRepoAction(repo.name, "starting");
    setFeedback(null);
    try {
      await ingestApi.startIngestion({
        repo_url: repo.clone_url,
        repo_name: repo.name,
      });
      setRepos((prev) =>
        prev.map((r) =>
          r.name === repo.name
            ? { ...r, indexing_status: "indexing" }
            : r
        )
      );
      setFeedback({
        repoName: repo.name,
        type: "success",
        message: "Indexing started. This can take a few minutes.",
      });
    } catch (err) {
      let message = err instanceof ApiError ? err.message : err instanceof Error ? err.message : "Failed to start indexing";
      setFeedback({ repoName: repo.name, type: "error", message });
    } finally {
      setRepoAction(repo.name, "idle");
    }
  };

  const handleStartBranchIngestion = async (repo: GithubRepo) => {
    setConfirmRepo(repo);
  };

  const confirmDeepIndexing = async () => {
    if (!confirmRepo) return;
    const repo = confirmRepo;
    setConfirmRepo(null);

    setRepoAction(repo.name, "starting");
    setFeedback(null);
    try {
      await branchIngestApi.startBranchIngestion({
        repo_url: repo.clone_url,
        repo_name: repo.name,
      });
      setRepos((prev) =>
        prev.map((r) =>
          r.name === repo.name
            ? { ...r, indexing_status: "indexing" }
            : r
        )
      );
      setFeedback({
        repoName: repo.name,
        type: "success",
        message: "Deep indexing started.",
      });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : err instanceof Error ? err.message : "Failed to start indexing";
      setFeedback({ repoName: repo.name, type: "error", message });
    } finally {
      setRepoAction(repo.name, "idle");
    }
  };

  const handleManualIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = manualUrl.trim();
    if (!url) return;
    setIsManualSubmitting(true);
    setError(null);
    try {
      const fullName = url.replace("https://github.com/", "").replace(".git", "");
      const repoName = fullName.replace(/\//g, "_");
      if (manualDeepIndex) {
        await branchIngestApi.startBranchIngestion({ repo_url: url, repo_name: repoName });
      } else {
        await ingestApi.startIngestion({ repo_url: url, repo_name: repoName });
      }
      setManualUrl("");
      setFeedback({ repoName, type: "success", message: "Manual indexing started." });
      setTimeout(loadRepos, 1500);
    } catch (err: any) {
      setError(err.message || "Manual ingestion failed.");
    } finally {
      setIsManualSubmitting(false);
    }
  };

  const handleDeleteRepo = async (name: string) => {
    if (!window.confirm(`Delete data for ${name}?`)) return;
    setRepoAction(name, "deleting");
    try {
      await reposApi.deleteRepo(name);
      loadRepos();
    } catch (err: any) {
      setFeedback({ repoName: name, type: "error", message: err.message || "Delete failed" });
    } finally {
      setRepoAction(name, "idle");
    }
  };

  const renderStatusBadge = (repo: GithubRepo) => {
    const status = repo.indexing_status;
    if (status === "completed") return (
      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Ready</span>
        </div>
        {repo.indexed_at && (
          <span className="text-[10px] text-gray-400 font-medium mr-1">
            Completed {new Date(repo.indexed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    );
    if (status === "indexing" || status === "pending") return (
      <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
        <span>Indexing...</span>
      </div>
    );
    if (status === "failed") return (
      <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-medium">
        <AlertCircle className="w-3.5 h-3.5" />
        <span>Failed</span>
      </div>
    );
    return <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-sm font-medium"><span>Not Ingested</span></div>;
  };

  return (
    <div className="flex h-screen bg-white">
      <Sidebar currentPage="datasources" navigateTo={navigateTo} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b border-gray-200 bg-white px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
                <Database className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#0F172A]">Data Sources</h1>
                <p className="text-gray-600 text-sm">Connect GitHub repositories and index them for reasoning</p>
              </div>
            </div>
            <button onClick={loadRepos} disabled={loading} className="px-4 py-2 border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-colors flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <Card className="p-6 border-2 border-gray-200 rounded-xl bg-white blueprint-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><PlayCircle className="w-5 h-5" /></div>
                <div><h2 className="text-xl font-semibold text-[#0F172A]">Manual Repository Ingestion</h2><p className="text-gray-500 text-sm">Ingest any public or private GitHub repository by URL</p></div>
              </div>
              <form onSubmit={handleManualIngest} className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <GitBranch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1E3A8A]" />
                    <input type="text" value={manualUrl} onChange={(e) => setManualUrl(e.target.value)} placeholder="https://github.com/owner/repository" className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-[#E2E8F0] focus:border-[#38BDF8] outline-none transition-all" />
                  </div>
                  <button type="submit" disabled={isManualSubmitting || !manualUrl.trim()} className="px-8 py-3 bg-[#1E3A8A] text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-900/10"><Database className="w-4 h-4" />Start Indexing</button>
                </div>
                <div className="flex items-center justify-between p-4 bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-xl">
                  <div className="flex items-center gap-3"><Activity className="w-4 h-4 text-blue-600" /><div><p className="text-sm font-semibold text-[#0F172A]">Deep Multi-Branch Analysis</p><p className="text-xs text-[#64748B]">Reason across all branches, PRs, and commit history</p></div></div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={manualDeepIndex} onChange={(e) => setManualDeepIndex(e.target.checked)} />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#1E3A8A] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                  </label>
                </div>
              </form>
            </Card>

            <div className="grid grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border-2 border-purple-100"><div className="flex items-center justify-between mb-2"><span className="text-sm text-gray-600">Repositories</span><Database className="w-5 h-5 text-purple-600" /></div><div className="text-3xl font-semibold text-gray-900">{repos.length}</div></div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-100"><div className="flex items-center justify-between mb-2"><span className="text-sm text-gray-600">Indexed</span><CheckCircle2 className="w-5 h-5 text-green-600" /></div><div className="text-3xl font-semibold text-gray-900">{indexedCount}</div></div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-100"><div className="flex items-center justify-between mb-2"><span className="text-sm text-gray-600">Total Chunks</span><Activity className="w-5 h-5 text-blue-600" /></div><div className="text-3xl font-semibold text-gray-900">{totalChunks.toLocaleString()}</div></div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Search ${activeTab === 'your-repos' ? 'your' : 'public'} repositories...`} className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none" />
            </div>

            {error && <div className="rounded-xl border-2 border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

            <Tabs defaultValue="your-repos" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="bg-white border-2 border-gray-200 p-1 h-auto mb-6">
                <TabsTrigger value="your-repos" className="px-6 py-2.5 text-sm font-bold data-[state=active]:bg-[#1E3A8A] data-[state=active]:text-white transition-all flex items-center gap-2"><UserIcon className="w-4 h-4" />Your Repositories</TabsTrigger>
                <TabsTrigger value="public-repos" className="px-6 py-2.5 text-sm font-bold data-[state=active]:bg-[#1E3A8A] data-[state=active]:text-white transition-all flex items-center gap-2"><Globe className="w-4 h-4" />Public Ingested Repos</TabsTrigger>
              </TabsList>

              <TabsContent value="your-repos" className="mt-0">
                {loading && <div className="flex items-center justify-center py-16 text-gray-500"><Loader2 className="w-5 h-5 animate-spin mr-2" />Loading repositories…</div>}
                {!loading && filteredRepos.length === 0 && <div className="rounded-xl border-2 border-dashed border-gray-200 p-10 text-center text-gray-500 bg-white">No repositories match your filter.</div>}
                {!loading && filteredRepos.length > 0 && (
                  <div className="space-y-4">
                    {filteredRepos.map((repo) => {
                      const action = actionState[repo.name] || "idle";
                      const showFeedback = feedback?.repoName === repo.name ? feedback : null;
                      return (
                        <div key={repo.id} className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-blue-300 transition-all">
                          <div className="flex items-start justify-between mb-4 gap-4">
                            <div className="flex items-start gap-4 min-w-0">
                              <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl"><GitBranch className="w-6 h-6 text-white" /></div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap"><h3 className="text-lg font-semibold text-gray-900 truncate">{repo.name}</h3>{repo.private && <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full"><Lock className="w-3 h-3" /> private</span>}{repo.language && <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{repo.language}</span>}</div>
                                <p className="text-sm text-gray-600 truncate">{repo.full_name}</p>
                                {repo.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{repo.description}</p>}
                              </div>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">{renderStatusBadge(repo)}</div>
                          </div>
                          <div className="grid grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-xl">
                            <div><p className="text-xs text-gray-500 mb-1">Branch</p><p className="text-sm font-medium text-gray-900">{repo.default_branch || "main"}</p></div>
                            <div><p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Star className="w-3 h-3" /> Stars</p><p className="text-sm font-medium text-gray-900">{repo.stars || 0}</p></div>
                            <div><p className="text-xs text-gray-500 mb-1">Chunks</p><p className="text-sm font-medium text-gray-900">{repo.chunks_count || 0}</p></div>
                            <div><p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Indexed</p><p className="text-sm font-medium text-gray-900">{repo.indexed_at ? new Date(repo.indexed_at).toLocaleDateString() : "—"}</p></div>
                          </div>
                          {showFeedback && <div className={`mb-4 p-3 rounded-lg border text-sm ${showFeedback.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{showFeedback.message}</div>}
                          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                            {repo.indexing_status !== "completed" && repo.indexing_status !== "indexing" && (
                              <button onClick={() => handleStartIngestion(repo)} disabled={action === "starting"} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm">Index main</button>
                            )}
                            {!repo.has_branch_index && repo.indexing_status !== "indexing" && (
                              <button onClick={() => handleStartBranchIngestion(repo)} disabled={action === "starting"} className="px-4 py-2 border-2 border-[#1E3A8A] text-[#1E3A8A] rounded-lg text-sm">Deep Index</button>
                            )}
                            {repo.indexing_status === "completed" && (
                              <button onClick={() => navigateTo(`query?repo=${repo.name}`)} className="px-4 py-2 bg-[#1E3A8A] text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 shadow-md shadow-blue-900/10"><MessageSquare className="w-4 h-4" /> Chat</button>
                            )}
                            <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 border rounded-lg text-sm flex items-center gap-2"><ExternalLink className="w-4 h-4" /> GitHub</a>
                            {repo.is_indexed && <button onClick={() => handleDeleteRepo(repo.name)} disabled={action === "deleting"} className="px-4 py-2 border-2 border-red-100 text-red-600 rounded-lg text-sm ml-auto">Delete</button>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="public-repos" className="mt-0">
                {loading && <div className="flex items-center justify-center py-16 text-gray-500"><Loader2 className="w-5 h-5 animate-spin mr-2" />Loading...</div>}
                {!loading && filteredPublicRepos.length === 0 && <div className="rounded-xl border-2 border-dashed border-gray-200 p-10 text-center text-gray-500 bg-white">No public repositories found.</div>}
                {!loading && filteredPublicRepos.length > 0 && (
                  <div className="space-y-4">
                    {filteredPublicRepos.map((repo) => (
                      <div key={repo.id} className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-blue-300 transition-all">
                        <div className="flex items-start justify-between mb-4 gap-4">
                          <div className="flex items-start gap-4 min-w-0">
                            <div className="p-3 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl text-white"><Globe className="w-6 h-6" /></div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap"><h3 className="text-lg font-semibold text-gray-900 truncate">{repo.repo_name}</h3><span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">PUBLIC</span></div>
                              <p className="text-sm text-gray-600 truncate">{repo.full_name}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0"><span className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-bold flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" />Ready</span></div>
                        </div>
                        <div className="grid grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-xl">
                          <div><p className="text-xs text-gray-500 mb-1">Branch</p><p className="text-sm font-medium text-gray-900">{repo.default_branch || "main"}</p></div>
                          <div><p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Star className="w-3 h-3" /> Stars</p><p className="text-sm font-medium text-gray-900">{repo.stars || 0}</p></div>
                          <div><p className="text-xs text-gray-500 mb-1">Files</p><p className="text-sm font-medium text-gray-900">{repo.files_count || 0}</p></div>
                          <div><p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Indexed</p><p className="text-sm font-medium text-gray-900">{repo.indexed_at ? new Date(repo.indexed_at).toLocaleDateString() : "—"}</p></div>
                        </div>
                        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                          {repo.status === 'completed' ? (
                            <button onClick={() => navigateTo(`query?repo=${repo.repo_name}`)} className="px-4 py-2 bg-[#1E3A8A] text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 shadow-md shadow-blue-900/10"><MessageSquare className="w-4 h-4" /> Chat</button>
                          ) : (
                            <div className="px-4 py-2 bg-gray-100 text-gray-400 rounded-lg text-sm font-medium flex items-center gap-2">
                              {repo.status === 'indexing' || repo.status === 'pending' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
                              {repo.status === 'indexing' || repo.status === 'pending' ? "Indexing..." : "Pending"}
                            </div>
                          )}
                          <a href={repo.repo_url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 border rounded-lg text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors"><ExternalLink className="w-4 h-4" /> Source</a>
                          <button onClick={() => handleDeleteRepo(repo.repo_name)} disabled={actionState[repo.repo_name] === "deleting"} className="px-4 py-2 border-2 border-red-100 text-red-600 rounded-lg text-sm ml-auto hover:bg-red-50 hover:border-red-200 transition-all">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {confirmRepo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md p-8 bg-white shadow-2xl">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="p-4 bg-blue-50 rounded-full text-[#1E3A8A]"><GitBranch className="w-12 h-12" /></div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-[#0F172A]">Deep Indexing</h3>
                <p className="text-[#64748B]">You are about to perform a multi-branch ingestion for <span className="font-semibold text-[#1E3A8A]">{confirmRepo.name}</span>.</p>
              </div>
              <div className="flex gap-3 w-full pt-4">
                <button onClick={() => setConfirmRepo(null)} className="flex-1 px-4 py-3 border-2 rounded-xl font-medium text-[#64748B]">Cancel</button>
                <button onClick={confirmDeepIndexing} className="flex-1 px-4 py-3 bg-[#1E3A8A] text-white rounded-xl font-bold">Start Deep Index</button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
