import { apiRequest } from "./client";
import type { DashboardStats } from "./types";

/**
 * Get dashboard statistics for the authenticated user
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  return apiRequest("/api/dashboard/stats");
}
