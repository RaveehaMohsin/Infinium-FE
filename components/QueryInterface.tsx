"use client";

import { useState } from "react";
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
  AlertCircle
} from "lucide-react";

interface QueryInterfaceProps {
  navigateTo: (page: string) => void;
}

interface Message {
  id: number;
  type: "user" | "assistant";
  content: string;
  timestamp: string;
  sources?: { type: string; title: string; }[];
  reasoning?: string;
}

export function QueryInterface({ navigateTo }: QueryInterfaceProps) {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: "assistant",
      content: "Hello! I'm Infinium, your autonomous reasoning agent. I can help you understand your codebase, architecture decisions, and development patterns. Ask me anything!",
      timestamp: "10:30 AM"
    }
  ]);

  const suggestedQueries = [
    "Why was JWT authentication deprecated in v3?",
    "Show endpoints with recurring 500 errors this week",
    "What caching patterns are most used across services?",
    "Explain our microservices architecture evolution"
  ];

  const handleSendQuery = () => {
    if (!query.trim()) return;

    const newUserMessage: Message = {
      id: messages.length + 1,
      type: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newUserMessage]);

    // Simulate AI response
    setTimeout(() => {
      const response: Message = {
        id: messages.length + 2,
        type: "assistant",
        content: generateResponse(query),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: [
          { type: "commit", title: "feat: migrate from JWT to OAuth2 (#342)" },
          { type: "docs", title: "Authentication Strategy v3.0" },
          { type: "pr", title: "PR #342: Security enhancement discussion" }
        ],
        reasoning: "I analyzed 15 commits, 3 pull requests, and 2 architecture documents to trace the authentication migration decision."
      };
      setMessages(prev => [...prev, response]);
    }, 1500);

    setQuery("");
  };

  const generateResponse = (query: string) => {
    if (query.toLowerCase().includes("jwt") || query.toLowerCase().includes("authentication")) {
      return "JWT authentication was deprecated in v3 due to security concerns and scalability requirements. The team migrated to OAuth2 with refresh token rotation for better security. This decision was made in PR #342 after discovering session management issues in the JWT implementation. The migration was completed over 3 sprints with zero downtime.";
    }
    if (query.toLowerCase().includes("500 errors") || query.toLowerCase().includes("errors")) {
      return "Based on CI/CD logs and Sentry reports from the past week, I found 3 endpoints with recurring 500 errors:\n\n1. /api/v2/users/profile - 47 errors (Database connection timeout)\n2. /api/v2/orders/checkout - 23 errors (Payment gateway integration)\n3. /api/v2/analytics/reports - 18 errors (Memory overflow)\n\nThe most critical is the users/profile endpoint affecting 1,200+ users.";
    }
    if (query.toLowerCase().includes("caching")) {
      return "Across your services, I identified 3 primary caching patterns:\n\n1. Redis for session storage (8 services)\n2. In-memory LRU cache for API responses (12 services)\n3. CDN caching for static assets (All frontend services)\n\nThe Redis pattern is most commonly used for user-related data with TTL of 3600s.";
    }
    return "I've analyzed your codebase and found relevant information. Based on the context from your repositories, documentation, and commit history, here's what I discovered...";
  };

  const handleSuggestedQuery = (suggested: string) => {
    setQuery(suggested);
  };

  return (
    <div className="flex h-screen bg-white blueprint-bg">
      <Sidebar currentPage="query" navigateTo={navigateTo} />
      
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b-2 border-[#1E3A8A] px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-[#38BDF8]"></div>
              <div>
                <h1 className="text-3xl font-bold text-[#0F172A]">Query Interface</h1>
                <p className="text-[#64748B] mt-1">Ask questions about your codebase and get reasoning-based answers</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-2 border-[#38BDF8] text-[#38BDF8]">
                <span className="w-2 h-2 bg-[#38BDF8] rounded-full mr-2 blueprint-pulse"></span>
                RAG Engine Active
              </Badge>
            </div>
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-3xl ${message.type === 'user' ? 'w-auto' : 'w-full'}`}>
                {message.type === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-[#1E3A8A] border-2 border-[#38BDF8] rounded-sm flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" strokeWidth={1.5} />
                    </div>
                    <span className="text-[#64748B] text-sm blueprint-label">Infinium Assistant</span>
                    <span className="text-[#CBD5E1] text-xs">{message.timestamp}</span>
                  </div>
                )}
                
                <Card className={`p-6 border-2 ${
                  message.type === 'user' 
                    ? 'bg-[#1E3A8A] border-[#1E3A8A]' 
                    : 'blueprint-card bg-white'
                }`}>
                  <p className={`${message.type === 'user' ? 'text-white' : 'text-[#0F172A]'} leading-relaxed whitespace-pre-line`}>
                    {message.content}
                  </p>

                  {message.reasoning && (
                    <div className="mt-4 pt-4 border-t-2 border-[#E2E8F0]">
                      <p className="text-[#64748B] text-sm flex items-center gap-2">
                        <Sparkles className="w-4 h-4" strokeWidth={1.5} />
                        <span className="italic">{message.reasoning}</span>
                      </p>
                    </div>
                  )}

                  {message.sources && (
                    <div className="mt-4 pt-4 border-t-2 border-[#E2E8F0]">
                      <p className="text-[#64748B] text-sm mb-3 blueprint-label">Sources referenced:</p>
                      <div className="space-y-2">
                        {message.sources.map((source, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm border-2 border-[#E2E8F0] p-2 rounded-sm hover:border-[#38BDF8] transition-colors">
                            {source.type === 'commit' && <GitCommit className="w-4 h-4 text-[#1E3A8A]" strokeWidth={1.5} />}
                            {source.type === 'docs' && <FileText className="w-4 h-4 text-[#FACC15]" strokeWidth={1.5} />}
                            {source.type === 'pr' && <AlertCircle className="w-4 h-4 text-[#38BDF8]" strokeWidth={1.5} />}
                            <span className="text-[#0F172A]">{source.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {message.type === 'assistant' && (
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t-2 border-[#E2E8F0]">
                      <Button size="sm" variant="ghost" className="text-[#64748B] hover:text-[#1E3A8A]">
                        <Copy className="w-4 h-4 mr-2" strokeWidth={1.5} />
                        Copy
                      </Button>
                      <Button size="sm" variant="ghost" className="text-[#64748B] hover:text-[#38BDF8]">
                        <ThumbsUp className="w-4 h-4 mr-2" strokeWidth={1.5} />
                        Helpful
                      </Button>
                      <Button size="sm" variant="ghost" className="text-[#64748B] hover:text-[#EF4444]">
                        <ThumbsDown className="w-4 h-4 mr-2" strokeWidth={1.5} />
                        Not helpful
                      </Button>
                    </div>
                  )}
                </Card>

                {message.type === 'user' && (
                  <div className="flex items-center justify-end gap-2 mt-2">
                    <span className="text-[#CBD5E1] text-xs blueprint-label">{message.timestamp}</span>
                    <CheckCircle className="w-4 h-4 text-[#38BDF8]" strokeWidth={1.5} />
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Suggested Queries */}
          {messages.length === 1 && (
            <div className="max-w-3xl">
              <p className="text-[#64748B] text-sm mb-4 blueprint-label">Try asking:</p>
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
        </div>

        {/* Input Area */}
        <div className="border-t-2 border-[#1E3A8A] bg-white p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-4">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendQuery()}
                placeholder="Ask about architecture, code patterns, errors, or anything else..."
                className="flex-1 border-2 border-[#CBD5E1] text-[#0F172A] placeholder:text-[#CBD5E1] focus:border-[#38BDF8]"
              />
              <Button 
                onClick={handleSendQuery}
                disabled={!query.trim()}
                className="bg-[#1E3A8A] hover:bg-[#38BDF8] text-white border-2 border-[#1E3A8A] hover:border-[#38BDF8]"
              >
                <Send className="w-4 h-4 mr-2" strokeWidth={1.5} />
                Send
              </Button>
            </div>
            <p className="text-[#64748B] text-xs mt-3 flex items-center gap-1 blueprint-label">
              <Clock className="w-3 h-3" strokeWidth={1.5} />
              Powered by GPT-4o + RAG Engine | Average response time: 1.2s
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
