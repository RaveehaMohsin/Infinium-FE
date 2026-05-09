import { apiRequest } from "./client";
import type { GithubRepo, IndexedRepository } from "./types";

export async function listAllRepos(): Promise<{
  repositories: GithubRepo[];
  total: number;
  indexed_count: number;
}> {
  return apiRequest("/api/repos");
}

export async function listIndexedRepos(): Promise<{
  repositories: IndexedRepository[];
  total: number;
}> {
  return apiRequest("/api/repos/indexed");
}

export async function getRepoStatus(
  repoName: string
): Promise<IndexedRepository> {
  return apiRequest(`/api/repos/${encodeURIComponent(repoName)}/status`);
}

export async function deleteRepo(repoName: string): Promise<void> {
  return apiRequest(`/api/repos/${encodeURIComponent(repoName)}`, {
    method: "DELETE",
  });
}
