import { apiRequest } from "./client";
import type {
  Conversation,
  ConversationDetail,
  ConversationStartResponse,
  QueryAnswer,
} from "./types";

export async function askQuestion(input: {
  repo_name: string;
  query: string;
  conversation_id?: string | null;
}): Promise<QueryAnswer> {
  return apiRequest("/api/query", {
    method: "POST",
    body: {
      repo_name: input.repo_name,
      query: input.query,
      ...(input.conversation_id ? { conversation_id: input.conversation_id } : {}),
    },
  });
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
