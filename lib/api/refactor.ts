import { apiRequest } from "./client";

export type Granularity = "function" | "file";

export interface RepoSymbol {
  kind: "function" | "class";
  name: string;
  start: number;
  end: number;
}

export interface RepoTreeFile {
  path: string;
  language: string;
  symbols?: RepoSymbol[];
}

export interface RepoTree {
  repo_name: string;
  files: RepoTreeFile[];
  total: number;
}

export interface RepoFile {
  repo_name: string;
  path: string;
  language: string;
  size: number;
  content: string;
  symbols: RepoSymbol[];
}

export interface RefactorResult {
  found: boolean;
  reason?: string;
  granularity?: Granularity;
  repo_name?: string;
  target?: string;
  file?: string;
  language?: string;
  before?: string;
  after?: string;
  diff?: string;
  rationale?: string;
  risks?: string;
  callers_used?: number;
  neighbours_used?: number;
  model?: string;
  duration_ms?: number;
  tokens?: number;
  error?: string;
}

export async function getRepoTree(repoName: string, repoUrl?: string): Promise<RepoTree> {
  let url = `/api/repos/${encodeURIComponent(repoName)}/tree?include_symbols=true`;
  if (repoUrl) url += `&repo_url=${encodeURIComponent(repoUrl)}`;
  const res = await apiRequest<{ success: boolean; data: RepoTree }>(url);
  // Node BE wraps Python responses in { success, data }
  return (res as { data: RepoTree }).data ?? (res as unknown as RepoTree);
}

export async function getRepoFile(
  repoName: string,
  path: string,
  repoUrl?: string,
): Promise<RepoFile> {
  let url = `/api/repos/${encodeURIComponent(repoName)}/file?path=${encodeURIComponent(path)}`;
  if (repoUrl) url += `&repo_url=${encodeURIComponent(repoUrl)}`;
  const res = await apiRequest<{ success: boolean; data: RepoFile }>(url);
  return (res as { data: RepoFile }).data ?? (res as unknown as RepoFile);
}

export async function refactor(input: {
  repo_name: string;
  granularity: Granularity;
  target: string;
  instruction: string;
  file?: string;
  code?: string;
  model?: string;
}): Promise<RefactorResult> {
  const res = await apiRequest<{ success: boolean; data: RefactorResult }>(
    "/api/code/refactor",
    { method: "POST", body: input }
  );
  return (res as { data: RefactorResult }).data ?? (res as unknown as RefactorResult);
}

export async function submitFeedback(input: {
  target_type: "refactor" | "query" | "explain";
  target_id?: string;
  query: string;
  answer: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  repo_name?: string;
  metadata?: Record<string, unknown>;
}): Promise<{ success: boolean }> {
  return apiRequest("/api/feedback", { method: "POST", body: input });
}

export interface FeedbackSummary {
  total: number;
  up: number;
  down: number;
  helpfulness_rate: number;   // 0..1
  average_rating: number;     // 0..5
}

export interface FeedbackDayPoint extends FeedbackSummary {
  date: string;
}

export interface FeedbackNegative {
  id: number;
  target_type: string;
  repo_name: string;
  query: string;
  comment: string;
  rating: number;
  created_at: string;
}

export interface FeedbackMetrics {
  window_days: number;
  filters: { target_type: string | null; repo_name: string | null };
  summary: FeedbackSummary;
  by_day: FeedbackDayPoint[];
  by_target_type: Record<string, FeedbackSummary>;
  by_model: Record<string, FeedbackSummary>;
  by_repo: Record<string, FeedbackSummary>;
  recent_negatives: FeedbackNegative[];
}

export async function getFeedbackMetrics(
  params: { days?: number; targetType?: string; repoName?: string } = {},
): Promise<FeedbackMetrics> {
  const q = new URLSearchParams();
  q.set("days", String(params.days ?? 30));
  if (params.targetType) q.set("target_type", params.targetType);
  if (params.repoName) q.set("repo_name", params.repoName);
  return apiRequest(`/api/feedback/metrics?${q.toString()}`);
}
