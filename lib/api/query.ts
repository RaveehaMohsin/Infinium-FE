import { apiRequest, getToken, API_BASE_URL } from "./client";
import type {
  Conversation,
  ConversationDetail,
  ConversationStartResponse,
  QueryAllInput,
  QueryAllResponse,
  QueryAnswer,
} from "./types";

export async function askQuestion(input: {
  repo_name: string;
  query: string;
  conversation_id?: string | null;
  branch_filter?: string | null;
}): Promise<QueryAnswer> {
  return apiRequest("/api/query", {
    method: "POST",
    body: {
      repo_name: input.repo_name,
      query: input.query,
      ...(input.conversation_id ? { conversation_id: input.conversation_id } : {}),
      ...(input.branch_filter ? { branch_filter: input.branch_filter } : {}),
    },
  });
}

/**
 * Stream a question for real-time word-by-word response
 */
export async function* streamQuestion(input: {
  repo_name: string;
  query: string;
  conversation_id: string;
  branch_filter?: string | null;
}) {
  const token = getToken();
  const url = `${API_BASE_URL}/api/query?stream=true`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      repo_name: input.repo_name,
      query: input.query,
      conversation_id: input.conversation_id,
      branch_filter: input.branch_filter,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to start stream");
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
        const parsed = JSON.parse(chunk);
        if (parsed.answer) {
          yield parsed.answer;
          continue;
        } else if (parsed.content) {
          yield parsed.content;
          continue;
        }
      } catch (e) {
        // Partial JSON or other error, try regex extraction
        const answerMatch = chunk.match(/"answer"\s*:\s*"((?:[^"\\]|\\.)*)"/);
        if (answerMatch && answerMatch[1]) {
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

export async function startConversation(input: {
  repo_name: string;
  title?: string;
}): Promise<ConversationStartResponse> {
  return apiRequest("/api/conversation", {
    method: "POST",
    body: input,
  });
}

export async function listConversations(): Promise<{
  conversations: Conversation[];
  total: number;
}> {
  return apiRequest("/api/conversation");
}

export async function getConversation(
  id: string
): Promise<ConversationDetail> {
  return apiRequest(`/api/conversation/${encodeURIComponent(id)}`);
}

export async function deleteConversation(id: string): Promise<void> {
  return apiRequest(`/api/conversation/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

/**
 * Ask a question across multiple or all repositories
 */
export async function askAllRepos(
  input: QueryAllInput
): Promise<QueryAllResponse> {
  return apiRequest("/api/query/all", {
    method: "POST",
    body: input,
  });
}
