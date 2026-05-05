"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
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
} from "lucide-react";
import {
  ApiError,
  GithubRepo,
  authApi,
  ingestApi,
  reposApi,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface DataSourcesProps {
  navigateTo: (page: string) => void;
}

type RepoActionState = "idle" | "starting" | "deleting";

export function DataSources({ navigateTo }: DataSourcesProps) {
  const { user } = useAuth();
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [actionState, setActionState] = useState<Record<string, RepoActionState>>({});
  const [feedback, setFeedback] = useState<{
    repoName: string;
    type: "success" | "error";
    message: string;
  } | null>(null);

  const isGithubUser = user?.auth_provider === "github";

  const loadRepos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reposApi.listAllRepos();
      setRepos(data.repositories);
    } catch (err) {
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
          indexing.map((r) =>
            ingestApi
              .getIngestionStatus(r.name)
              .then((status) => ({ name: r.name, status }))
              .catch(() => null)
          )
        );
        setRepos((prev) =>
          prev.map((repo) => {
            const update = updates.find((u) => u && u.name === repo.name);
            if (!update) return repo;
            return {
              ...repo,
              indexing_status: update.status.status,
              chunks_count: update.status.chunks_count ?? repo.chunks_count,
              indexed_at: update.status.indexed_at ?? repo.indexed_at,
              is_indexed:
                update.status.status === "completed" || repo.is_indexed,
            };
          })
        );
      } catch {
        // silent — next tick will retry
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
            ? { ...r, indexing_status: "indexing", is_indexed: true }
            : r
        )
      );
      setFeedback({
        repoName: repo.name,
        type: "success",
        message: "Indexing started. This can take a few minutes.",
      });
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to start indexing";
      setFeedback({ repoName: repo.name, type: "error", message });
    } finally {
      setRepoAction(repo.name, "idle");
    }
  };

  const handleDelete = async (repo: GithubRepo) => {
    if (
      !window.confirm(
        `Remove "${repo.name}" from the index? This won't delete the repo on GitHub.`
      )
    ) {
      return;
    }
    setRepoAction(repo.name, "deleting");
    setFeedback(null);
    try {
      await reposApi.deleteRepo(repo.name);
      setRepos((prev) =>
        prev.map((r) =>
          r.name === repo.name
            ? {
                ...r,
                is_indexed: false,
                indexing_status: null,
                chunks_count: 0,
                indexed_at: null,
              }
            : r
        )
      );
      setFeedback({
        repoName: repo.name,
        type: "success",
        message: "Removed from index.",
      });
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to remove repository";
      setFeedback({ repoName: repo.name, type: "error", message });
    } finally {
      setRepoAction(repo.name, "idle");
    }
  };

  const renderStatusBadge = (repo: GithubRepo) => {
    const status = repo.indexing_status;
    if (status === "completed") {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Indexed</span>
        </div>
      );
    }
    if (status === "indexing" || status === "pending") {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>{status === "pending" ? "Queued" : "Indexing"}</span>
        </div>
      );
    }
    if (status === "failed") {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Failed</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-sm">
        <span>Not indexed</span>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-white">
      <Sidebar currentPage="datasources" navigateTo={navigateTo} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
                <Database className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl">Data Sources</h1>
                <p className="text-gray-600 text-sm">
                  Connect GitHub repositories and index them for reasoning
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={loadRepos}
                disabled={loading || !isGithubUser}
                className="px-4 py-2 border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-colors flex items-center gap-2 disabled:opacity-60"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {!isGithubUser && (
              <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-amber-900">
                      Connect GitHub to index repositories
                    </h3>
                    <p className="text-sm text-amber-800 mt-1">
                      You're signed in with email. Sign in with GitHub to list
                      and index your repositories.
                    </p>
                    <button
                      onClick={() => {
                        window.location.href = authApi.getGithubLoginUrl();
                      }}
                      className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800 transition-colors text-sm"
                    >
                      <GitBranch className="w-4 h-4" />
                      Connect GitHub
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border-2 border-purple-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Repositories</span>
                  <Database className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-3xl font-semibold text-gray-900">
                  {repos.length}
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Indexed</span>
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-3xl font-semibold text-gray-900">
                  {indexedCount}
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Total Chunks</span>
                  <Activity className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-3xl font-semibold text-gray-900">
                  {totalChunks.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Search */}
            {isGithubUser && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search your repositories..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
            )}

            {/* Error / loading / list */}
            {error && (
              <div className="rounded-xl border-2 border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {isGithubUser && loading && (
              <div className="flex items-center justify-center py-16 text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Loading repositories…
              </div>
            )}

            {isGithubUser && !loading && filteredRepos.length === 0 && (
              <div className="rounded-xl border-2 border-dashed border-gray-200 p-10 text-center text-gray-500">
                No repositories match your filter.
              </div>
            )}

            {isGithubUser && !loading && filteredRepos.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Your Repositories
                </h2>
                <div className="space-y-4">
                  {filteredRepos.map((repo) => {
                    const action = actionState[repo.name] || "idle";
                    const showFeedback =
                      feedback?.repoName === repo.name ? feedback : null;
                    return (
                      <div
                        key={repo.id}
                        className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-blue-300 transition-all"
                      >
                        <div className="flex items-start justify-between mb-4 gap-4">
                          <div className="flex items-start gap-4 min-w-0">
                            <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl">
                              <GitBranch className="w-6 h-6 text-white" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-lg font-semibold text-gray-900 truncate">
                                  {repo.name}
                                </h3>
                                {repo.private && (
                                  <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                    <Lock className="w-3 h-3" /> private
                                  </span>
                                )}
                                {repo.language && (
                                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                    {repo.language}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 truncate">
                                {repo.full_name}
                              </p>
                              {repo.description && (
                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                  {repo.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            {renderStatusBadge(repo)}
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-xl">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Branch</p>
                            <p className="text-sm font-medium text-gray-900">
                              {repo.default_branch}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                              <Star className="w-3 h-3" /> Stars
                            </p>
                            <p className="text-sm font-medium text-gray-900">
                              {repo.stars.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Chunks</p>
                            <p className="text-sm font-medium text-gray-900">
                              {repo.chunks_count?.toLocaleString() || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Indexed
                            </p>
                            <p className="text-sm font-medium text-gray-900">
                              {repo.indexed_at
                                ? new Date(repo.indexed_at).toLocaleDateString()
                                : "—"}
                            </p>
                          </div>
                        </div>

                        {showFeedback && (
                          <div
                            className={`mb-4 rounded-lg border p-3 text-sm ${
                              showFeedback.type === "success"
                                ? "border-green-200 bg-green-50 text-green-700"
                                : "border-red-200 bg-red-50 text-red-700"
                            }`}
                          >
                            {showFeedback.message}
                          </div>
                        )}

                        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                          {repo.indexing_status !== "completed" &&
                            repo.indexing_status !== "indexing" && (
                              <button
                                onClick={() => handleStartIngestion(repo)}
                                disabled={action === "starting"}
                                className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors flex items-center gap-2 text-sm disabled:opacity-60"
                              >
                                {action === "starting" ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <PlayCircle className="w-4 h-4" />
                                )}
                                {repo.indexing_status === "failed"
                                  ? "Retry indexing"
                                  : "Index repo"}
                              </button>
                            )}
                          {(repo.indexing_status === "indexing" ||
                            repo.indexing_status === "pending") && (
                            <span className="px-4 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Working on it…
                            </span>
                          )}
                          {repo.indexing_status === "completed" && (
                            <button
                              onClick={() => navigateTo("query")}
                              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm flex items-center gap-2"
                            >
                              Ask questions
                            </button>
                          )}
                          <a
                            href={repo.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
                          >
                            <ExternalLink className="w-4 h-4" />
                            View on GitHub
                          </a>
                          {repo.is_indexed && (
                            <button
                              onClick={() => handleDelete(repo)}
                              disabled={action === "deleting"}
                              className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2 text-sm ml-auto disabled:opacity-60"
                            >
                              {action === "deleting" ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                              Remove from index
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
