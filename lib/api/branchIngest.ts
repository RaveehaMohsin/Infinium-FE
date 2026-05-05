import { apiRequest } from "./client";
import type {
  BranchIngestStartResponse,
  BranchIngestStatus,
} from "./types";

/**
 * Start ingesting all branches of a repository
 */
export async function startBranchIngestion(input: {
  repo_url: string;
  repo_name: string;
}): Promise<BranchIngestStartResponse> {
  return apiRequest("/api/branch-ingest", {
    method: "POST",
    body: input,
  });
}

/**
 * Get branch ingestion status
 */
export async function getBranchIngestionStatus(
  repoName: string
): Promise<BranchIngestStatus> {
  return apiRequest(`/api/branch-ingest/${encodeURIComponent(repoName)}/status`);
}
