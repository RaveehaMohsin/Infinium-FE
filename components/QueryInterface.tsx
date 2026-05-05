"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Sparkles,
  Clock,
  CheckCircle,
  Copy,
  ThumbsUp,
  ThumbsDown,
  GitCommit,
  FileText,
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
  Terminal,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ApiError,
  Conversation,
  ConversationMessage,
  IndexedRepository,
  QuerySource,
  queryApi,
  reposApi,
} from "@/lib/api";

interface QueryInterfaceProps {
  navigateTo: (page: string) => void;
}

interface DisplayMessage {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: string;
  sources?: QuerySource[];
  model?: string | null;
  tokens?: number | null;
}

const greeting: DisplayMessage = {
  id: "greeting",
  type: "assistant",
  content:
    "Hi! Pick an indexed repository, then ask me anything about its code, history, or architecture.",
  timestamp: "",
};

function formatTime(input?: string) {
  const date = input ? new Date(input) : new Date();
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function sourceLabel(source: QuerySource): string {
  return (
    source.title ||
    source.file_path ||
    source.repo_name ||
    (typeof source.type === "string" ? source.type : "Source")
  );
}

function sourceIcon(source: QuerySource) {
  const t = source.type?.toLowerCase() || "";
  if (t.includes("commit")) return GitCommit;
  if (t.includes("doc") || source.file_path) return FileText;
  return AlertCircle;
}

export function QueryInterface({ navigateTo }: QueryInterfaceProps) {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<DisplayMessage[]>([greeting]);
  const [repos, setRepos] = useState<IndexedRepository[]>([]);
  const [reposLoading, setReposLoading] = useState(true);
  const [selectedRepo, setSelectedRepo] = useState<string>("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    null
  );
  const [selectedBranch, setSelectedBranch] = useState<string>(""); // Default to empty, will be set when repo is picked
  const [conversationLoading, setConversationLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadRepos = useCallback(async () => {
    setReposLoading(true);
    try {
      const data = await reposApi.listIndexedRepos();
      const completed = data.repositories.filter(
        (r) => r.status === "completed"
      );
      setRepos(completed);
      setSelectedRepo((current) => {
        const selected = current && completed.some((r) => r.repo_name === current)
          ? current
          : completed[0]?.repo_name || "";
        
        if (selected) {
          const repo = completed.find(r => r.repo_name === selected);
          // Default to "all" if it has multiple branches, otherwise default branch or main
          const branches = repo?.indexed_branches || [];
          if (repo?.has_branch_index || branches.length > 1) {
            setSelectedBranch("all");
          } else {
            setSelectedBranch(repo?.default_branch || branches[0] || "main");
          }
        }
        return selected;
      });
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to load repositories";
      setError(message);
    } finally {
      setReposLoading(false);
    }
  }, []);

  const loadConversations = useCallback(async () => {
    try {
      const data = await queryApi.listConversations();
      setConversations(data.conversations);
    } catch {
      // non-fatal
    }
  }, []);

  useEffect(() => {
    loadRepos();
    loadConversations();
  }, [loadRepos, loadConversations]);

  const repoConversations = useMemo(
    () => conversations.filter((c) => c.repo_name === selectedRepo),
    [conversations, selectedRepo]
  );

  const selectedRepoObj = useMemo(
    () => repos.find((r) => r.repo_name === selectedRepo),
    [repos, selectedRepo]
  );

  const messagesFromConversation = (msgs: ConversationMessage[]): DisplayMessage[] =>
    msgs.map((m) => ({
      id: m.id,
      type: m.role,
      content: m.content,
      timestamp: formatTime(m.created_at),
      sources: m.sources || undefined,
      model: m.model_used,
      tokens: m.tokens_used,
    }));

  const openConversation = async (id: string) => {
    setConversationLoading(true);
    setError(null);
    try {
      const detail = await queryApi.getConversation(id);
      setActiveConversationId(detail.conversation.id);
      setSelectedRepo(detail.conversation.repo_name);
      const loaded = messagesFromConversation(detail.messages);
      setMessages(loaded.length ? loaded : [greeting]);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to load conversation";
      setError(message);
    } finally {
      setConversationLoading(false);
    }
  };

  const startNewConversation = () => {
    setActiveConversationId(null);
    setMessages([greeting]);
    setError(null);
  };

  const handleDeleteConversation = async (id: string) => {
    if (!window.confirm("Delete this conversation?")) return;
    try {
      await queryApi.deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (id === activeConversationId) {
        startNewConversation();
      }
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to delete conversation";
      setError(message);
    }
  };

  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSendQuery = async () => {
    const text = query.trim();
    if (!text || !selectedRepo || sending) return;

    setSending(true);
    setError(null);
    setStatusMessage("Scanning your codebase...");

    const userMessage: DisplayMessage = {
      id: `local-${Date.now()}`,
      type: "user",
      content: text,
      timestamp: formatTime(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setQuery("");

    let conversationId = activeConversationId;
    try {
      if (!conversationId && selectedRepo !== "all") {
        setStatusMessage("Connecting to intelligence engine...");
        const conv = await queryApi.startConversation({
          repo_name: selectedRepo,
          title: text.slice(0, 80),
        });
        conversationId = conv.conversation_id;
        setActiveConversationId(conversationId);
        setConversations((prev) => [
          {
            id: conv.conversation_id,
            user_github_id: 0,
            repo_name: conv.repo_name,
            title: conv.title,
            created_at: conv.created_at,
            updated_at: conv.created_at,
          },
          ...prev,
        ]);
      }

      const assistantMessageId = `assistant-${Date.now()}`;
      
      if (selectedRepo === "all") {
        setStatusMessage("Reasoning across multiple repositories...");
        const answer = await queryApi.askAllRepos({
          query: text,
        });
        
        const assistantMessage: DisplayMessage = {
          id: assistantMessageId,
          type: "assistant",
          content: answer.answer,
          timestamp: formatTime(),
          sources: answer.sources,
          model: answer.model,
          tokens: answer.tokens_used,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        setStatusMessage("Analyzing your question...");
        await new Promise(r => setTimeout(r, 600));
        setStatusMessage("Searching codebase for relevant snippets...");
        await new Promise(r => setTimeout(r, 800));
        setStatusMessage("Retrieving repository context and commits...");
        await new Promise(r => setTimeout(r, 600));
        setStatusMessage("Synthesizing answer with AI RAG engine...");
        
        let fullContent = "";
        let hasStartedStreaming = false;
        const stream = queryApi.streamQuestion({
          repo_name: selectedRepo,
          query: text,
          conversation_id: conversationId!,
          branch_filter: selectedBranch === "all" ? null : selectedBranch,
        });

        for await (const chunk of stream) {
          if (!hasStartedStreaming) {
            hasStartedStreaming = true;
            setStatusMessage(null); // Hide status as soon as first chunk arrives
            
            const placeholder: DisplayMessage = {
              id: assistantMessageId,
              type: "assistant",
              content: "",
              timestamp: formatTime(),
            };
            setMessages((prev) => [...prev, placeholder]);
          }
          
          fullContent += chunk;
          setMessages((prev) => 
            prev.map(m => m.id === assistantMessageId ? {
              ...m,
              content: fullContent,
            } : m)
          );
        }
      }
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to get an answer";
      setError(message);
      setMessages((prev) => [
        ...prev.filter(m => m.content !== ""), // Remove placeholder if empty
        {
          id: `error-${Date.now()}`,
          type: "assistant",
          content: `⚠️ ${message}`,
          timestamp: formatTime(),
        },
      ]);
    } finally {
      setSending(false);
      setStatusMessage(null);
    }
  };

  const suggestedQueries = [
    "Walk me through the main entry points of this repo.",
    "What are the most important modules and how do they fit together?",
    "Are there any known issues or TODOs?",
    "Summarize the recent commit history.",
  ];

  const handleSuggestedQuery = (suggested: string) => setQuery(suggested);

  const noRepos = !reposLoading && repos.length === 0;

  return (
    <div className="flex h-screen bg-white blueprint-bg">
      <Sidebar currentPage="query" navigateTo={navigateTo} />

      <main className="flex-1 flex">
        {/* Conversation list */}
        <aside className="w-72 border-r-2 border-[#E2E8F0] bg-white flex flex-col">
          <div className="p-4 border-b-2 border-[#E2E8F0] space-y-2">
            <label className="text-xs uppercase tracking-wide text-[#64748B] blueprint-label">
              Repository
            </label>
            <select
              value={selectedRepo}
              onChange={(e) => {
                setSelectedRepo(e.target.value);
                const repo = repos.find(r => r.repo_name === e.target.value);
                setSelectedBranch(repo?.default_branch || "main");
                startNewConversation();
              }}
              disabled={reposLoading || noRepos}
              className="w-full px-3 py-2 rounded-md border-2 border-[#CBD5E1] focus:border-[#38BDF8] focus:outline-none text-sm"
            >
              {reposLoading ? (
                <option>Loading…</option>
              ) : noRepos ? (
                <option>No indexed repos</option>
              ) : (
                <>
                  <option value="all">All Repositories</option>
                  {repos.map((repo) => (
                    <option key={repo.id} value={repo.repo_name}>
                      {repo.repo_name}
                    </option>
                  ))}
                </>
              )}
            </select>
            {noRepos && (
              <button
                onClick={() => navigateTo("datasources")}
                className="w-full text-xs text-[#1E3A8A] hover:text-[#38BDF8] underline text-left"
              >
                Index a repository to get started →
              </button>
            )}
            <Button
              onClick={startNewConversation}
              disabled={noRepos}
              className="w-full bg-[#1E3A8A] hover:bg-[#38BDF8] text-white border-2 border-[#1E3A8A] hover:border-[#38BDF8]"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              New conversation
            </Button>

            {selectedRepo !== "all" && (
              <div className="pt-2 space-y-2">
                <label className="text-xs uppercase tracking-wide text-[#64748B] blueprint-label">
                  Branch Scope
                </label>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border-2 border-[#CBD5E1] focus:border-[#38BDF8] focus:outline-none text-sm"
                >
                  <option value={selectedRepoObj?.default_branch || "main"}>
                    {selectedRepoObj?.default_branch || "main"} (Default)
                  </option>
                  <option value="all">All Indexed Branches</option>
                  {selectedRepoObj?.indexed_branches?.map((br) => (
                    <option key={br} value={br}>
                      {br}
                    </option>
                  ))}
                  {(!selectedRepoObj?.indexed_branches || selectedRepoObj.indexed_branches.length === 0) && (
                    <option value={selectedRepoObj?.default_branch || "main"}>
                      {selectedRepoObj?.default_branch || "main"} (Default)
                    </option>
                  )}
                </select>
              </div>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {repoConversations.length === 0 ? (
              <p className="text-xs text-[#64748B] px-2 py-4">
                No conversations yet for this repo.
              </p>
            ) : (
              repoConversations.map((conv) => {
                const isActive = conv.id === activeConversationId;
                return (
                  <div
                    key={conv.id}
                    className={`group flex items-start gap-2 p-3 rounded-md border-2 transition-colors cursor-pointer ${
                      isActive
                        ? "border-[#1E3A8A] bg-[#F1F5FF]"
                        : "border-[#E2E8F0] hover:border-[#38BDF8]"
                    }`}
                    onClick={() => openConversation(conv.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#0F172A] truncate">
                        {conv.title}
                      </p>
                      <p className="text-xs text-[#64748B] mt-1">
                        {new Date(conv.updated_at).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteConversation(conv.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-[#64748B] hover:text-[#EF4444]"
                      aria-label="Delete conversation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Conversation column */}
        <section className="flex-1 flex flex-col min-w-0">
          <header className="bg-white border-b-2 border-[#1E3A8A] px-8 py-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-1 h-8 bg-[#38BDF8]"></div>
                <div className="min-w-0">
                  <h1 className="text-3xl font-bold text-[#0F172A]">
                    Query Interface
                  </h1>
                  <p className="text-[#64748B] mt-1 truncate">
                    {selectedRepo
                      ? `Asking about "${selectedRepo}"`
                      : "Pick an indexed repo to start asking questions"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge
                  variant="outline"
                  className="border-2 border-[#38BDF8] text-[#38BDF8]"
                >
                  <span className="w-2 h-2 bg-[#38BDF8] rounded-full mr-2 blueprint-pulse"></span>
                  RAG Engine
                </Badge>
              </div>
            </div>
          </header>

          {error && (
            <div className="px-8 pt-4">
              <div className="rounded-md border-2 border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            {conversationLoading && (
              <div className="flex items-center gap-2 text-[#64748B]">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading conversation…
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-3xl ${message.type === "user" ? "w-auto" : "w-full"}`}
                >
                  {message.type === "assistant" && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-[#1E3A8A] border-2 border-[#38BDF8] rounded-sm flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" strokeWidth={1.5} />
                      </div>
                      <span className="text-[#64748B] text-sm blueprint-label">
                        Infinium Assistant
                      </span>
                      {message.timestamp && (
                        <span className="text-[#CBD5E1] text-xs">
                          {message.timestamp}
                        </span>
                      )}
                    </div>
                  )}

                  <Card
                    className={`p-6 border-2 ${
                      message.type === "user"
                        ? "bg-[#1E3A8A] border-[#1E3A8A]"
                        : "blueprint-card bg-white"
                    }`}
                  >
                    <div className={`${message.type === "user" ? "text-white" : "text-[#0F172A]"} leading-relaxed markdown-content`}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                      </ReactMarkdown>
                    </div>

                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-4 pt-4 border-t-2 border-[#E2E8F0]">
                        <p className="text-[#64748B] text-sm mb-3 blueprint-label">
                          Sources referenced:
                        </p>
                        <div className="space-y-2">
                          {message.sources.map((source, idx) => {
                            const Icon = sourceIcon(source);
                            return (
                              <div
                                key={idx}
                                className="flex items-center gap-2 text-sm border-2 border-[#E2E8F0] p-2 rounded-sm hover:border-[#38BDF8] transition-colors"
                              >
                                <Icon
                                  className="w-4 h-4 text-[#1E3A8A]"
                                  strokeWidth={1.5}
                                />
                                <span className="text-[#0F172A] truncate">
                                  {sourceLabel(source)}
                                </span>
                                {typeof source.score === "number" && (
                                  <span className="ml-auto text-xs text-[#64748B]">
                                    {source.score.toFixed(2)}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {message.type === "assistant" && message.id !== "greeting" && (
                      <div className="flex items-center gap-2 mt-4 pt-4 border-t-2 border-[#E2E8F0] text-xs text-[#64748B]">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            navigator.clipboard?.writeText(message.content)
                          }
                          className="text-[#64748B] hover:text-[#1E3A8A]"
                        >
                          <Copy className="w-4 h-4 mr-2" strokeWidth={1.5} />
                          Copy
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-[#64748B] hover:text-[#38BDF8]"
                        >
                          <ThumbsUp className="w-4 h-4 mr-2" strokeWidth={1.5} />
                          Helpful
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-[#64748B] hover:text-[#EF4444]"
                        >
                          <ThumbsDown
                            className="w-4 h-4 mr-2"
                            strokeWidth={1.5}
                          />
                          Not helpful
                        </Button>
                      </div>
                    )}
                  </Card>

                  {message.type === "user" && (
                    <div className="flex items-center justify-end gap-2 mt-2">
                      <span className="text-[#CBD5E1] text-xs blueprint-label">
                        {message.timestamp}
                      </span>
                      <CheckCircle
                        className="w-4 h-4 text-[#38BDF8]"
                        strokeWidth={1.5}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}

            {sending && (
              <div className="flex justify-start">
                <div className="w-full">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-[#1E3A8A] border-2 border-[#38BDF8] rounded-sm flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white animate-pulse" strokeWidth={1.5} />
                    </div>
                    <span className="text-[#64748B] text-sm blueprint-label">
                      {statusMessage || "Infinium Assistant is thinking..."}
                    </span>
                  </div>
                  <Card className="p-6 border-2 border-dashed border-[#38BDF8] bg-[#F8FAFC]">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-4 h-4 animate-spin text-[#1E3A8A]" />
                        <span className="text-sm text-[#1E3A8A] font-medium animate-pulse">
                          {statusMessage ? "Processing your intelligence..." : "Receiving intelligence from RAG engine..."}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 w-3/4 bg-[#E2E8F0] rounded-full animate-pulse"></div>
                        <div className="h-2 w-1/2 bg-[#E2E8F0] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {messages.length === 1 && !noRepos && (
              <div className="max-w-3xl">
                <p className="text-[#64748B] text-sm mb-4 blueprint-label">
                  Try asking:
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {suggestedQueries.map((suggested, idx) => (
                    <Card
                      key={idx}
                      onClick={() => handleSuggestedQuery(suggested)}
                      className="blueprint-card p-4 bg-white hover:border-[#38BDF8] cursor-pointer transition-colors"
                    >
                      <p className="text-[#0F172A] text-sm">{suggested}</p>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="border-t-2 border-[#1E3A8A] bg-white p-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex gap-4">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendQuery();
                    }
                  }}
                  placeholder={
                    noRepos
                      ? "Index a repo before asking questions"
                      : "Ask about architecture, code patterns, errors, or anything else…"
                  }
                  disabled={sending || noRepos}
                  className="flex-1 border-2 border-[#CBD5E1] text-[#0F172A] placeholder:text-[#CBD5E1] focus:border-[#38BDF8]"
                />
                <Button
                  onClick={handleSendQuery}
                  disabled={!query.trim() || sending || noRepos}
                  className="bg-[#1E3A8A] hover:bg-[#38BDF8] text-white border-2 border-[#1E3A8A] hover:border-[#38BDF8]"
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" strokeWidth={1.5} />
                  )}
                  Send
                </Button>
              </div>
              <p className="text-[#64748B] text-xs mt-3 flex items-center gap-1 blueprint-label">
                <Clock className="w-3 h-3" strokeWidth={1.5} />
                Powered by your indexed repos via Infinium's RAG engine.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
