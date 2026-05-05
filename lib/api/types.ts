export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string;
  avatar_url?: string | null;
  auth_provider: "email" | "github";
  created_at?: string;
  last_login_at?: string | null;
}

export interface AuthPayload {
  token: string;
  user: User;
}

export interface RegisterInput {
  email: string;
  username: string;
  password: string;
  full_name?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export type IndexingStatus =
  | "pending"
  | "indexing"
  | "completed"
  | "failed"
  | null;

export interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  clone_url: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  default_branch: string;
  updated_at: string;
  size: number;
  is_indexed: boolean;
  indexing_status: IndexingStatus;
  indexed_at: string | null;
  chunks_count: number;
}

export interface IndexedRepository {
  id: string;
  repo_name: string;
  repo_url: string;
  full_name: string;
  owner_github_id: number;
  status: Exclude<IndexingStatus, null>;
  is_private: boolean;
  default_branch: string;
  language: string | null;
  stars: number;
  chunks_count: number;
  files_count: number;
  commits_count: number;
  indexed_at: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface IngestStartResponse {
  repo_name: string;
  status: "indexing";
  polling_endpoint: string;
}

export interface IngestStatus {
  repo_name: string;
  status: Exclude<IndexingStatus, null>;
  chunks_count: number;
  files_count: number;
  commits_count: number;
  indexed_at: string | null;
  error_message: string | null;
  python_status?: unknown;
}

export interface QuerySource {
  file_path?: string;
  repo_name?: string;
  type?: string;
  title?: string;
  content?: string;
  score?: number;
  [key: string]: unknown;
}

export interface QueryAnswer {
  answer: string;
  sources: QuerySource[];
  model: string | null;
  tokens_used: number;
  conversation_id: string | null;
}

export interface Conversation {
  id: string;
  user_github_id: number;
  repo_name: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ConversationMessage {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  sources: QuerySource[] | null;
  model_used: string | null;
  tokens_used: number | null;
  created_at: string;
}

export interface ConversationDetail {
  conversation: Conversation;
  messages: ConversationMessage[];
  total_messages: number;
}

export interface ConversationStartResponse {
  conversation_id: string;
  repo_name: string;
  title: string;
  created_at: string;
}
