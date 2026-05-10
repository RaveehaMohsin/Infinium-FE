import { apiRequest } from "./client";
import type { ApiResponse } from "./types";

export interface PdfAnalysis {
  id: string;
  file_name: string;
  file_size: number;
  summary: string;
  keyEntities: string[];
  technologies: string[];
  requirements: string[];
  recommendations: string[];
  fullAnalysis: string;
  created_at: string;
}

export interface PdfAnalysisListResponse {
  analyses: PdfAnalysis[];
  total: number;
}

/**
 * Analyze a PDF document
 * @param file - PDF file to analyze
 * @returns Analysis result
 */
export async function analyzePdf(file: File): Promise<PdfAnalysis> {
  const formData = new FormData();
  formData.append('file', file);

  const token = localStorage.getItem('infinium_token');
  
  // Use the full backend URL directly
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  
  const response = await fetch(`${API_BASE_URL}/api/pdf/analyze`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to analyze PDF');
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.message || 'Analysis failed');
  }

  return data.data;
}

/**
 * Get user's analysis history
 */
export async function getAnalysisHistory(): Promise<PdfAnalysisListResponse> {
  const data = await apiRequest<{ analyses: PdfAnalysis[]; total: number }>('/api/pdf/history');
  return {
    analyses: data.analyses || [],
    total: data.total || 0
  };
}

/**
 * Get specific analysis by ID
 */
export async function getAnalysisById(id: string): Promise<PdfAnalysis> {
  const data = await apiRequest<PdfAnalysis>(`/api/pdf/history/${id}`);
  return data;
}

/**
 * Delete analysis
 */
export async function deleteAnalysis(id: string): Promise<void> {
  await apiRequest(`/api/pdf/history/${id}`, { method: 'DELETE' });
}