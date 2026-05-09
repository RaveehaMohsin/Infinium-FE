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
  has_branch_index?: boolean;
  indexed_branches?: string[];
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
  has_branch_index?: boolean;
  error_message: string | null;
  indexed_branches?: string[];
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

export type DocumentationType = "overview" | "setup" | "api" | "full";

export interface Documentation {
  id: string;
  repo_name: string;
  title: string;
  summary: string;
  type: DocumentationType;
  doc_type: DocumentationType;
  markdown: string;
  content?: string;
  sources: QuerySource[];
  model: string | null;
  tokens_used: number;
  created_at: string;
  updated_at: string;
}

export interface DocumentationSummary {
  id: string;
  repo_name: string;
  doc_type: DocumentationType;
  created_at: string;
  updated_at: string;
}

export interface DocumentationGenerateInput {
  repo_name: string;
  doc_type?: DocumentationType;
  type?: DocumentationType;
  branch_filter?: string | null;
}

export interface DashboardStats {
  repositories_indexed: number;
  total_queries: number;
  avg_accuracy_score: number;
  total_chunks: number;
  repository_stats: {
    total: number;
    completed: number;
    indexing: number;
    failed: number;
    pending: number;
    total_chunks: number;
    total_files: number;
    total_commits: number;
    languages: { name: string; count: number }[];
  };
  query_stats: {
    total_questions: number;
    total_answers: number;
    avg_tokens_per_answer: number;
    questions_last_7_days: number;
    questions_by_day: { date: string; count: number }[];
    top_repos_by_queries: { name: string; count: number }[];
    models_used: { name: string; count: number }[];
  };
  conversation_stats: {
    total_conversations: number;
    avg_messages_per_conversation: number;
    most_discussed_repos: { name: string; message_count: number }[];
    conversations_last_30_days: { date: string; count: number }[];
  };
  documentation_stats: {
    total_docs: number;
    by_type: { type: string; count: number }[];
    last_generated: string | null;
    repos_with_docs: number;
  };
  recent_activity: {
    recent_queries: {
      question: string;
      repo_name: string;
      asked_at: string;
    }[];
    recent_docs: {
      repo_name: string;
      doc_type: string;
      generated_at: string;
    }[];
    currently_indexing: { repo_name: string; status: string }[];
    recently_indexed: {
      repo_name: string;
      language: string | null;
      chunks: number;
      indexed_at: string;
      has_branch_index?: boolean;
    }[];
  };
  performance_stats: {
    avg_response_time_ms: number | null;
    success_rate: number;
    total_tokens_used: number;
  };
}

export interface BranchIngestStatus {
  repo_name: string;
  status: IndexingStatus;
  branches_count: number;
  branches_list: string[];
  chunks_count: number;
  files_count: number;
  commits_count: number;
  indexed_at: string | null;
  error_message: string | null;
}

export interface BranchIngestStartResponse {
  repo_name: string;
  status: "indexing";
  branches_count: number;
}

export interface QueryAllInput {
  query: string;
  repo_names?: string[];
}

export interface QueryAllResponse {
  answer: string;
  sources: QuerySource[];
  model: string | null;
  tokens_used: number;
  repos_searched: string[] | "all";
  repos_with_results: string[];
}
