"use client";

import { useCallback, useEffect, useMemo, useState, useRef } from "react";
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
  User as UserIcon,
  X
} from "lucide-react";
import {
  ApiError,
  GithubRepo,
  ingestApi,
  reposApi,
  branchIngestApi,
  type IndexedRepository,
  type IngestStatus,
  type BranchIngestStatus
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface DataSourcesProps {
  navigateTo: (page: string) => void;
}

type RepoActionState = "idle" | "starting" | "deleting";

interface ProgressData {
  status: string;
  step?: string;
  percent_complete?: number;
  elapsed_seconds?: number;
  eta_seconds?: number;
  chunks_processed?: number;
  chunks_total?: number;
  files_processed?: number;
  commits_processed?: number;
}

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

  const fakeProgressRef = useRef(0);

  // Progress popup state
  const [progressPopup, setProgressPopup] = useState<{
    repoName: string;
    isDeepIndex: boolean;
    progress: ProgressData | null;
  } | null>(null);

  const [completedPopup, setCompletedPopup] = useState<{ repoName: string; isDeepIndex: boolean } | null>(null);

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


      // If indexedData has a repositories property, use that, otherwise use indexedData directly
      const ingestedList = indexedData.repositories || indexedData;
      setIndexedRepos(ingestedList);

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

  // Fake progress only - no real backend progress
  useEffect(() => {
    if (!progressPopup) return;
    if (progressPopup.progress?.status === "completed") return;

    // Don't reset if we already have progress
    if (fakeProgressRef.current === 0 && progressPopup.progress?.percent_complete) {
      fakeProgressRef.current = progressPopup.progress.percent_complete;
    }

    const fakeInterval = setInterval(() => {
      // Random increment between 5-15%
      const increment = Math.floor(Math.random() * 15) + 5;
      fakeProgressRef.current = Math.min(fakeProgressRef.current + increment, 95);

      setProgressPopup(prev => {
        if (!prev) return null;
        return {
          ...prev,
          progress: {
            ...prev.progress,
            percent_complete: fakeProgressRef.current,
            step: "Processing...",
            status: "indexing"
          }
        };
      });
    }, 3000);

    return () => clearInterval(fakeInterval);
  }, [progressPopup]);
  // Simple polling to check if completed (no progress data)
  useEffect(() => {
    if (!progressPopup) return;

    const checkCompletion = setInterval(async () => {
      try {
        let statusData;
        if (progressPopup.isDeepIndex) {
          statusData = await branchIngestApi.getBranchIngestionStatus(progressPopup.repoName);
        } else {
          statusData = await ingestApi.getIngestionStatus(progressPopup.repoName);
        }

        const status = String(statusData.status);
        const isCompleted = status === "completed" || status === "complete";
        const isFailed = status === "failed";

        if (isCompleted) {
          // Jump to 100%
          setProgressPopup(prev => prev ? {
            ...prev,
            progress: {
              ...prev.progress,
              percent_complete: 100,
              status: "completed"
            }
          } : null);

          // Close popup and show completion toast
          setTimeout(() => {
            setProgressPopup(null);
            setCompletedPopup({
              repoName: progressPopup.repoName,
              isDeepIndex: progressPopup.isDeepIndex
            });
            setTimeout(() => setCompletedPopup(null), 5000);
            loadRepos();
          }, 1000);
        } else if (isFailed) {
          setProgressPopup(null);
          setFeedback({
            repoName: progressPopup.repoName,
            type: "error",
            message: statusData.error_message || "Indexing failed"
          });
        }
      } catch (err) {
        console.warn("Polling error:", err);
      }
    }, 3000);

    return () => clearInterval(checkCompletion);
  }, [progressPopup, loadRepos]);



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

  const ingestedRepos = useMemo(() => {
    return indexedRepos;
  }, [indexedRepos]);

  const filteredIngestedRepos = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return ingestedRepos;
    return ingestedRepos.filter(
      (repo) =>
        repo.repo_name?.toLowerCase().includes(q) ||
        repo.full_name?.toLowerCase().includes(q)
    );
  }, [ingestedRepos, search]);

  const indexedCount = useMemo(
    () => indexedRepos.length,
    [indexedRepos]
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

    // Reset fake progress counter
    fakeProgressRef.current = 0;

    // Show progress popup with 0%
    setProgressPopup({
      repoName: repo.name,
      isDeepIndex: false,
      progress: { status: "indexing", percent_complete: 0 }
    });

    try {
      await ingestApi.startIngestion({
        repo_url: repo.clone_url,
        repo_name: repo.name,
      });
      loadRepos();
    } catch (err) {
      setProgressPopup(null);
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

    fakeProgressRef.current = 0;

    try {
      await branchIngestApi.startBranchIngestion({
        repo_url: repo.clone_url,
        repo_name: repo.name,
      });

      setProgressPopup({
        repoName: repo.name,
        isDeepIndex: true,
        progress: { status: "indexing", percent_complete: 0 }
      });

      setFeedback({
        repoName: repo.name,
        type: "success",
        message: "Deep indexing started.",
      });
      loadRepos();
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

    // Reset fake progress counter
    fakeProgressRef.current = 0;

    try {
      const fullName = url.replace("https://github.com/", "").replace(".git", "");
      const repoName = fullName.replace(/\//g, "_");

      if (manualDeepIndex) {
        await branchIngestApi.startBranchIngestion({ repo_url: url, repo_name: repoName });
      } else {
        await ingestApi.startIngestion({ repo_url: url, repo_name: repoName });
      }

      setManualUrl("");
      setProgressPopup({
        repoName: repoName,
        isDeepIndex: manualDeepIndex,
        progress: { status: "indexing", percent_complete: 0 }
      });
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

  const formatTime = (seconds?: number) => {
    if (!seconds) return "0 min";
    const mins = Math.floor(seconds / 60);
    if (mins < 1) return "< 1 min";
    return `${mins} min`;
  };

  const getStepDisplay = (step?: string) => {
    const steps: Record<string, string> = {
      cloning: "Cloning repository...",
      scanning_files: "Scanning files...",
      extracting_branches: "Extracting branches...",
      extracting_diffs: "Extracting commit history...",
      chunking: "Chunking content...",
      embedding: "Generating embeddings..."
    };
    return steps[step || ""] || "Processing...";
  };


  const renderStatusBadge = (repo: GithubRepo) => {
    const status = repo.indexing_status;
    if (status === "completed") return (
      <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Ready</span>
      </div>
    );
    if (status === "indexing" || status === "pending") return (
      <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
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

  const getTimeTaken = (createdAt: string | undefined, indexedAt: string | null) => {

    if (!indexedAt || !createdAt) {
      return null;
    }

    const start = new Date(createdAt);
    const end = new Date(indexedAt);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return null;
    }

    const diffSeconds = Math.floor((end.getTime() - start.getTime()) / 1000);

    if (diffSeconds <= 0) return "< 1 sec";
    if (diffSeconds < 60) return `${diffSeconds} sec`;
    if (diffSeconds < 3600) {
      const minutes = Math.floor(diffSeconds / 60);
      const seconds = diffSeconds % 60;
      return `${minutes} min ${seconds} sec`;
    }
    const hours = Math.floor(diffSeconds / 3600);
    const minutes = Math.floor((diffSeconds % 3600) / 60);
    return `${hours} hr ${minutes} min`;
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar currentPage="datasources" navigateTo={navigateTo} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b border-gray-200 bg-white px-4 sm:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
                <Database className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#0F172A]">Data Sources</h1>
                <p className="text-gray-600 text-sm hidden sm:block">Connect GitHub repositories and index them for reasoning</p>
              </div>
            </div>
            <button onClick={loadRepos} disabled={loading} className="px-4 py-2 border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-colors flex items-center gap-2 text-sm">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
            {/* Manual Ingestion Card */}
            <Card className="p-4 sm:p-6 border-2 border-gray-200 rounded-xl bg-white">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><PlayCircle className="w-5 h-5" /></div>
                <div><h2 className="text-lg sm:text-xl font-semibold text-[#0F172A]">Manual Repository Ingestion</h2><p className="text-gray-500 text-sm hidden sm:block">Ingest any public or private GitHub repository by URL</p></div>
              </div>
              <form onSubmit={handleManualIngest} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <GitBranch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1E3A8A]" />
                    <input
                      type="text"
                      value={manualUrl}
                      onChange={(e) => setManualUrl(e.target.value)}
                      placeholder="https://github.com/owner/repository"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-[#E2E8F0] focus:border-[#38BDF8] outline-none transition-all text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isManualSubmitting || !manualUrl.trim()}
                    className="px-6 py-3 bg-[#1E3A8A] text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-900/10 disabled:opacity-50"
                  >
                    {isManualSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                    Start Indexing
                  </button>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-xl gap-4">
                  <div className="flex items-center gap-3">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-semibold text-[#0F172A]">Deep Multi-Branch Analysis</p>
                      <p className="text-xs text-[#64748B]">Reason across all branches, PRs, and commit history</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={manualDeepIndex} onChange={(e) => setManualDeepIndex(e.target.checked)} />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#1E3A8A] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                  </label>
                </div>
              </form>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 sm:p-6 border-2 border-purple-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm text-gray-600">Repositories</span>
                  <Database className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-semibold text-gray-900">{repos.length}</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 sm:p-6 border-2 border-green-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm text-gray-600">Indexed</span>
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-semibold text-gray-900">{indexedCount}</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 sm:p-6 border-2 border-blue-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm text-gray-600">Total Chunks</span>
                  <Activity className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-semibold text-gray-900">{totalChunks.toLocaleString()}</div>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search repositories..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none text-sm"
              />
            </div>

            {error && <div className="rounded-xl border-2 border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

            {/* Tabs */}
            <Tabs defaultValue="your-repos" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="bg-white border-2 border-gray-200 p-1 h-auto mb-6">
                <TabsTrigger value="your-repos" className="px-4 sm:px-6 py-2 text-sm font-bold data-[state=active]:bg-[#1E3A8A] data-[state=active]:text-white transition-all flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  Your Repositories ({repos.length})
                </TabsTrigger>
                <TabsTrigger value="ingested-repos" className="px-4 sm:px-6 py-2 text-sm font-bold data-[state=active]:bg-[#1E3A8A] data-[state=active]:text-white transition-all flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Ingested Repos ({indexedRepos.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="your-repos" className="mt-0">
                {loading && <div className="flex items-center justify-center py-16 text-gray-500"><Loader2 className="w-6 h-6 animate-spin mr-2" />Loading repositories…</div>}
                {!loading && filteredRepos.length === 0 && <div className="rounded-xl border-2 border-dashed border-gray-200 p-10 text-center text-gray-500 bg-white">No repositories match your filter.</div>}
                {!loading && filteredRepos.length > 0 && (
                  <div className="space-y-4">
                    {filteredRepos.map((repo) => {
                      const action = actionState[repo.name] || "idle";
                      const showFeedback = feedback?.repoName === repo.name ? feedback : null;

                      return (
                        <div key={repo.id} className="bg-white rounded-xl border-2 border-gray-200 p-4 sm:p-6 hover:border-blue-300 transition-all">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-4">
                            <div className="flex items-start gap-4 min-w-0">
                              <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex-shrink-0">
                                <GitBranch className="w-6 h-6 text-white" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="text-lg font-semibold text-gray-900 truncate">{repo.name}</h3>
                                  {repo.private && <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full"><Lock className="w-3 h-3" /> private</span>}
                                  {repo.language && <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{repo.language}</span>}
                                </div>
                                <p className="text-sm text-gray-600 truncate">{repo.full_name}</p>
                                {repo.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{repo.description}</p>}
                              </div>
                            </div>
                            <div className="flex-shrink-0">{renderStatusBadge(repo)}</div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-xl">
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


              <TabsContent value="ingested-repos" className="mt-0">
                {loading && <div>Loading...</div>}
                {!loading && filteredIngestedRepos.length === 0 && (
                  <div className="rounded-xl border-2 border-dashed border-gray-200 p-10 text-center text-gray-500 bg-white">
                    No ingested repositories found.
                  </div>
                )}
                {!loading && filteredIngestedRepos.length > 0 && (
                  <div className="space-y-4">
                    {filteredIngestedRepos.map((repo) => (

                      <div key={repo.id} className="bg-white rounded-xl border-2 border-gray-200 p-4 sm:p-6 hover:border-blue-300 transition-all">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-4">
                          <div className="flex items-start gap-4 min-w-0">
                            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex-shrink-0">
                              <CheckCircle2 className="w-6 h-6 text-white" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-lg font-semibold text-gray-900 truncate">{repo.repo_name}</h3>
                              {repo.has_branch_index && (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                                  <GitBranch className="w-3 h-3" />
                                  Deep Indexed
                                </span>
                              )}
                              <p className="text-sm text-gray-600 truncate">{repo.repo_url}</p>
                              {repo.language && <span className="inline-block text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full mt-2">{repo.language}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Ready
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-4 p-4 bg-gray-50 rounded-xl">
                          <div className="col-span-1">
                            <p className="text-xs text-gray-500 mb-1">Branch</p>
                            <p className="text-sm font-medium text-gray-900">{repo.default_branch || "main"}</p>
                          </div>
                          <div className="col-span-1">
                            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Star className="w-3 h-3" /> Stars</p>
                            <p className="text-sm font-medium text-gray-900">{repo.stars || 0}</p>
                          </div>
                          <div className="col-span-1">
                            <p className="text-xs text-gray-500 mb-1">Chunks</p>
                            <p className="text-sm font-medium text-gray-900">{repo.chunks_count || 0}</p>
                          </div>
                          <div className="col-span-1">
                            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Indexed</p>
                            <p className="text-sm font-medium text-gray-900">{repo.indexed_at ? new Date(repo.indexed_at).toLocaleDateString() : "—"}</p>
                          </div>
                          <div className="col-span-1">
                            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Time Taken</p>
                            <p className="text-sm font-medium text-gray-900">{getTimeTaken(repo.created_at, repo.indexed_at) || "—"}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                          <button onClick={() => navigateTo(`query?repo=${repo.repo_name}`)} className="px-4 py-2 bg-[#1E3A8A] text-white rounded-lg text-sm font-bold flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Chat</button>
                          <a href={repo.repo_url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 border rounded-lg text-sm flex items-center gap-2"><ExternalLink className="w-4 h-4" /> GitHub</a>
                          <button onClick={() => handleDeleteRepo(repo.repo_name)} className="px-4 py-2 border-2 border-red-100 text-red-600 rounded-lg text-sm ml-auto">Delete</button>
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

      {/* Progress Popup */}
      {progressPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6 sm:p-8 bg-white shadow-2xl">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-blue-50 rounded-full text-[#1E3A8A]">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-[#0F172A]">
                  {progressPopup.isDeepIndex ? "Deep Indexing" : "Indexing"} Repository
                </h3>
                <p className="text-[#64748B]">{progressPopup.repoName}</p>
              </div>

              {/* Step / Status */}
              {progressPopup.progress?.step && (
                <p className="text-sm text-[#1E3A8A] font-medium">
                  {getStepDisplay(progressPopup.progress.step)}
                </p>
              )}

              {/* Progress Bar */}
              <div className="w-full pt-2">
                <div className="flex justify-between text-xs text-[#64748B] mb-1">
                  <span>Progress</span>
                  <span>{progressPopup.progress?.percent_complete || 0}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#1E3A8A] to-[#38BDF8] rounded-full transition-all duration-500"
                    style={{ width: `${progressPopup.progress?.percent_complete || 0}%` }}
                  />
                </div>
              </div>

              {/* Time Info - Only show if elapsed_seconds exists */}
              {(progressPopup.progress?.elapsed_seconds !== undefined && progressPopup.progress.elapsed_seconds > 0) && (
                <div className="flex justify-between w-full text-xs text-[#64748B] pt-2">
                  <span>⏱️ Elapsed: {formatTime(progressPopup.progress.elapsed_seconds)}</span>
                  {progressPopup.progress?.eta_seconds !== undefined && progressPopup.progress.eta_seconds > 0 && (
                    <span>⏳ Est. remaining: {formatTime(progressPopup.progress.eta_seconds)}</span>
                  )}
                </div>
              )}

              {/* Chunks progress if available */}
              {(progressPopup.progress?.chunks_processed !== undefined && progressPopup.progress.chunks_total !== undefined && progressPopup.progress.chunks_total > 0) && (
                <p className="text-xs text-[#64748B]">
                  Chunks: {progressPopup.progress.chunks_processed} / {progressPopup.progress.chunks_total}
                </p>
              )}

              <p className="text-sm text-[#64748B] pt-2">
                This may take a few minutes depending on repository size.
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Completion Popup */}
      {completedPopup && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-right-5 duration-300">
          <Card className="p-4 bg-green-50 border-2 border-green-200 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-full">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-green-800">Indexing Complete!</p>
                <p className="text-sm text-green-600">{completedPopup.repoName} is now ready for queries</p>
              </div>
              <button
                onClick={() => setCompletedPopup(null)}
                className="ml-2 p-1 text-green-600 hover:text-green-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-3 pt-3 border-t border-green-200">
              <button
                onClick={() => {
                  navigateTo(`query?repo=${completedPopup.repoName}`);
                  setCompletedPopup(null);
                }}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"
              >
                <MessageSquare className="w-4 h-4" /> Start Chatting
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmRepo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6 sm:p-8 bg-white shadow-2xl">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="p-4 bg-blue-50 rounded-full text-[#1E3A8A]">
                <GitBranch className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-[#0F172A]">Deep Indexing</h3>
                <p className="text-[#64748B]">You are about to perform a multi-branch ingestion for <span className="font-semibold text-[#1E3A8A]">{confirmRepo.name}</span>.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full pt-4">
                <button onClick={() => setConfirmRepo(null)} className="flex-1 px-4 py-3 border-2 rounded-xl font-medium text-[#64748B] hover:bg-gray-50 transition-colors">Cancel</button>
                <button onClick={confirmDeepIndexing} className="flex-1 px-4 py-3 bg-[#1E3A8A] text-white rounded-xl font-bold hover:bg-[#38BDF8] transition-colors">Start Deep Index</button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}