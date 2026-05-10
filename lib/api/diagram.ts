import { apiRequest } from "./client";
import type { Diagram, DiagramGenerateInput, GenerateDiagramResponse, DiagramListResponse } from "./types";



export async function generateDiagram(input: DiagramGenerateInput): Promise<Diagram> {
  const response = await apiRequest<GenerateDiagramResponse>("/api/diagram/generate", {
    method: "POST",
    body: input,
  });
  
  // Transform to match Diagram type
  return {
    id: response.id,
    user_id: "", // Will be populated from backend
    repo_name: response.repo_name,
    diagram_type: response.diagram_type,
    title: response.title,
    diagram_code: response.diagram_code,
    description: response.description,
    created_at: response.created_at,
    updated_at: response.updated_at
  };
}



export async function getUserDiagrams(): Promise<DiagramListResponse> {
  const data = await apiRequest<{ diagrams: Diagram[]; total: number }>("/api/diagram");
  return {
    diagrams: data.diagrams,
    total: data.total
  };
}

export async function getDiagramsByRepo(repoName: string): Promise<{ diagrams: Diagram[]; total: number }> {
  return apiRequest(`/api/diagram/repo/${encodeURIComponent(repoName)}`);
}

export async function getDiagramById(id: string): Promise<Diagram> {
  return apiRequest(`/api/diagram/${id}`);
}

export async function deleteDiagram(id: string): Promise<void> {
  return apiRequest(`/api/diagram/${id}`, { method: "DELETE" });
}

export async function regenerateDiagram(id: string, branchFilter?: string | null): Promise<{ diagram_code: string; sources: any[]; model: string }> {
  return apiRequest(`/api/diagram/regenerate/${id}`, {
    method: "POST",
    body: { branch_filter: branchFilter },
  });
}



