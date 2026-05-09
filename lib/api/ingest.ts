import { apiRequest } from "./client";
import type { IngestStartResponse, IngestStatus } from "./types";

export async function startIngestion(input: {
  repo_url: string;
  repo_name: string;
}): Promise<IngestStartResponse> {
  return apiRequest("/api/ingest", {
    method: "POST",
    body: input,
  });
}

export async function getIngestionStatus(
  repoName: string
): Promise<IngestStatus> {
  return apiRequest(`/api/ingest/${encodeURIComponent(repoName)}/status`);
}
