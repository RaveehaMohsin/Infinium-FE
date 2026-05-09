import { apiRequest, getToken, API_BASE_URL } from "./client";
import type {
  Documentation,
  DocumentationGenerateInput,
} from "./types";

/**
 * Generate or regenerate documentation for a repository
 */
export async function generateDocumentation(
  input: DocumentationGenerateInput
): Promise<Documentation> {
  return apiRequest("/api/docs/generate", {
    method: "POST",
    body: input,
  });
}

/**
 * Stream documentation generation for real-time viewing
 */
export async function* streamGenerateDocumentation(input: DocumentationGenerateInput) {
  const token = getToken();
  const url = `${API_BASE_URL}/api/docs/generate?stream=true`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to start documentation stream");
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No reader available");

  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    
    // Advanced extraction: if the chunk contains a JSON object with 'answer' or 'content'
    if (chunk.includes('"answer":') || chunk.includes('"content":')) {
      try {
        // Try to extract the string if it's a full JSON object
        const parsed = JSON.parse(chunk);
        if (parsed.answer) {
          yield parsed.answer;
          continue;
        } else if (parsed.content) {
          yield parsed.content;
          continue;
        }
      } catch (e) {
        // Partial JSON or other error, try regex extraction for 'answer'
        const answerMatch = chunk.match(/"answer"\s*:\s*"((?:[^"\\]|\\.)*)"/);
        if (answerMatch && answerMatch[1]) {
          // Unescape the captured string
          try {
            yield JSON.parse(`"${answerMatch[1]}"`);
            continue;
          } catch (err) {
            yield answerMatch[1];
            continue;
          }
        }
      }
    }
    
    yield chunk;
  }
}

/**
 * Get all documentation for the authenticated user
 */
export async function listUserDocs(): Promise<{
  documentation: Documentation[];
  total: number;
}> {
  return apiRequest("/api/docs");
}

/**
 * List documentation for a specific repository
 */
export async function listDocumentation(repoName: string): Promise<{
  docs: Documentation[];
}> {
  return apiRequest(`/api/docs/list/${encodeURIComponent(repoName)}`);
}

/**
 * Get specific documentation by ID
 */
export async function getDocumentationById(
  id: string
): Promise<Documentation> {
  return apiRequest(`/api/docs/${encodeURIComponent(id)}`);
}

/**
 * Delete documentation
 */
export async function deleteDocumentation(id: string): Promise<void> {
  return apiRequest(`/api/docs/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
