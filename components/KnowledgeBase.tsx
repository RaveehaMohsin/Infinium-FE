"use client";

import { useCallback, useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ExternalLink,
  BookOpen,
  Loader2,
  Plus,
  Search,
  FileText,
  Calendar,
  Activity,
  Trash2,
  X,
  Download,
  AlertTriangle,
} from "lucide-react";
import { docsApi, reposApi, ApiError, IndexedRepository, Documentation } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface KnowledgeBaseProps {
  navigateTo: (page: string) => void;
}

export function KnowledgeBase({ navigateTo }: KnowledgeBaseProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [repos, setRepos] = useState<IndexedRepository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>("");
  const [docs, setDocs] = useState<Documentation[]>([]);
  const [loading, setLoading] = useState(true);
  const [docsLoading, setDocsLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMultiBranch, setIsMultiBranch] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<Documentation | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Inject html2pdf and mermaid scripts dynamically
  useEffect(() => {
    const s1 = document.createElement("script");
    s1.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
    s1.async = true;
    document.body.appendChild(s1);

    const s2 = document.createElement("script");
    s2.src = "https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js";
    s2.async = true;
    s2.onload = () => {
      // @ts-ignore
      window.mermaid.initialize({ startOnLoad: true, theme: 'neutral' });
    };
    document.body.appendChild(s2);

    return () => {
      document.body.removeChild(s1);
      document.body.removeChild(s2);
    };
  }, []);

  // Custom code component for Mermaid
  const MarkdownComponents = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      if (!inline && match && match[1] === 'mermaid') {
        return (
          <div className="mermaid bg-white p-4 my-4 border-2 border-[#E2E8F0] rounded-sm flex justify-center">
            {String(children).replace(/\n$/, '')}
          </div>
        );
      }
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
  };

  useEffect(() => {
    if (viewingDoc) {
      setTimeout(() => {
        // @ts-ignore
        if (window.mermaid) window.mermaid.contentLoaded();
      }, 500);
    }
  }, [viewingDoc]);

  const downloadPdf = () => {
    if (!viewingDoc) return;
    const element = document.getElementById("kb-pdf-content");
    if (!element) return;

    const opt = {
      margin: [15, 15],
      filename: `${viewingDoc.repo_name}-${viewingDoc.doc_type}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    // @ts-ignore
    window.html2pdf().set(opt).from(element).save();
  };

  const loadRepos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await reposApi.listIndexedRepos();
      const completed = data.repositories.filter(r => r.status === "completed");
      setRepos(completed);
      if (completed.length > 0 && !selectedRepo) {
        setSelectedRepo(completed[0].repo_name);
      }
    } catch (err) {
      setError("Failed to load repositories");
    } finally {
      setLoading(false);
    }
  }, [selectedRepo]);

  const loadDocs = useCallback(async (repoName: string) => {
    if (!repoName) return [];
    setDocsLoading(true);
    try {
      const data = await docsApi.listDocumentation(repoName);

      const cleanedDocs = data.docs.map(doc => {
        let content = doc.markdown || doc.content || "";
        if (content.trim().startsWith('{')) {
          try {
            const parsed = JSON.parse(content);
            content = parsed.answer || parsed.content || content;
          } catch (e) {
            const match = content.match(/"answer"\s*:\s*"((?:[^"\\]|\\.)*)"/);
            if (match && match[1]) {
              try { content = JSON.parse(`"${match[1]}"`); } catch (err) { content = match[1]; }
            }
          }
        }
        return { ...doc, markdown: content };
      });

      setDocs(cleanedDocs);
      return cleanedDocs;
    } catch (err) {
      setError("Failed to load documentation");
      return [];
    } finally {
      setDocsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRepos();
  }, [loadRepos]);

  useEffect(() => {
    if (selectedRepo) {
      loadDocs(selectedRepo);
    }
  }, [selectedRepo, loadDocs]);

  const [docType, setDocType] = useState<"overview" | "setup" | "api" | "full">("overview");
  const [streamingContent, setStreamingContent] = useState("");

  const handleGenerate = async () => {
    if (!selectedRepo || generating) return;
    setGenerating(true);
    setError(null);
    setStreamingContent("");

    try {
      const tempDoc: Documentation = {
        id: "streaming",
        repo_name: selectedRepo,
        title: "Generating Documentation...",
        summary: "Please wait while Infinium AI writes your documentation...",
        type: docType,
        doc_type: docType,
        markdown: "",
        content: "",
        sources: [],
        model: null,
        tokens_used: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setViewingDoc(tempDoc);

      const stream = docsApi.streamGenerateDocumentation({
        repo_name: selectedRepo,
        doc_type: docType,
        type: docType,
        branch_filter: isMultiBranch ? "all" : null
      });

      let fullContent = "";
      for await (const chunk of stream) {
        fullContent += chunk;
        setStreamingContent(fullContent);
        setViewingDoc(prev => prev ? { ...prev, markdown: fullContent } : null);
      }

      const updatedDocs = await loadDocs(selectedRepo);
      const savedDoc = updatedDocs.find(d => d.doc_type === docType);
      if (savedDoc) {
        setViewingDoc(savedDoc);
      }
    } catch (err) {
      setError("Failed to generate documentation. Please try again.");
      setViewingDoc(null);
    } finally {
      setGenerating(false);
      setStreamingContent("");
    }
  };

  const handleDeleteDoc = async (id: string) => {
    try {
      await docsApi.deleteDocumentation(id);
      setDeleteConfirm(null);
      // Reload docs for current repo
      if (selectedRepo) {
        await loadDocs(selectedRepo);
      }
    } catch (err) {
      setError("Failed to delete documentation");
    }
  };

  const filteredDocs = docs.filter(doc =>
    doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.doc_type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const recentUpdates = docs.slice(0, 4).map(doc => ({
    title: `${doc.title} updated`,
    time: new Date(doc.updated_at).toLocaleDateString(),
    type: doc.doc_type
  }));

  const popularTags = [
    { name: "Architecture", count: docs.filter(d => d.doc_type === 'overview').length },
    { name: "API Reference", count: docs.filter(d => d.doc_type === 'api').length },
    { name: "Setup", count: docs.filter(d => d.doc_type === 'setup').length },
    { name: "Full Docs", count: docs.filter(d => d.doc_type === 'full').length },
  ].filter(tag => tag.count > 0);

  return (
    <div className="flex h-screen bg-white blueprint-bg overflow-hidden">
      <Sidebar currentPage="knowledge" navigateTo={navigateTo} />

      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b-2 border-[#1E3A8A] px-4 sm:px-8 py-4 sm:py-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 sm:h-8 bg-[#38BDF8]"></div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">Document Agent</h1>
              <p className="text-sm text-[#64748B] mt-1">AI-powered multi-branch documentation specialist</p>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-8 space-y-6">
          {/* Search and Filters - Responsive */}
          <Card className="blueprint-card p-4 sm:p-6 bg-white">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="w-full sm:w-64">
                  <select
                    value={selectedRepo}
                    onChange={(e) => setSelectedRepo(e.target.value)}
                    className="w-full h-10 px-3 py-2 rounded-md border-2 border-[#CBD5E1] focus:border-[#38BDF8] focus:outline-none text-sm"
                  >
                    {loading ? (
                      <option>Loading repos...</option>
                    ) : repos.length === 0 ? (
                      <option>No indexed repos</option>
                    ) : (
                      repos.map(r => <option key={r.id} value={r.repo_name}>{r.repo_name}</option>)
                    )}
                  </select>
                </div>
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#CBD5E1]" strokeWidth={1.5} />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search documentation..."
                    className="pl-9 sm:pl-10 border-2 border-[#CBD5E1] text-[#0F172A] focus:border-[#38BDF8] text-sm"
                  />
                </div>
                <div className="w-full sm:w-48">
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value as any)}
                    className="w-full h-10 px-3 py-2 rounded-md border-2 border-[#CBD5E1] focus:border-[#38BDF8] focus:outline-none text-sm"
                  >
                    <option value="overview">Project Overview</option>
                    <option value="setup">Setup Guide</option>
                    <option value="api">API Reference</option>
                    <option value="full">Full Documentation</option>
                  </select>
                </div>
                <Button
                  onClick={handleGenerate}
                  disabled={generating || !selectedRepo}
                  className="bg-[#1E3A8A] hover:bg-[#38BDF8] text-white whitespace-nowrap"
                >
                  {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                  Generate
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-10 h-5 rounded-full relative transition-colors ${isMultiBranch ? 'bg-[#38BDF8]' : 'bg-[#CBD5E1]'}`}>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={isMultiBranch}
                      onChange={(e) => setIsMultiBranch(e.target.checked)}
                    />
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isMultiBranch ? 'left-6' : 'left-1'}`}></div>
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-[#64748B] group-hover:text-[#1E3A8A]">Enable Multi-Branch Reasoning</span>
                </label>
                <div className="hidden sm:block h-4 w-px bg-gray-200"></div>
                <p className="text-xs text-[#64748B] italic">When enabled, the agent will synthesize information across all discovered branches and diffs.</p>
              </div>
            </div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </Card>

          {/* Main Content - Responsive Grid */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Main Content Area */}
            <div className="flex-1 space-y-6">
              <Tabs defaultValue="all" className="space-y-6">
                <TabsList className="bg-white border-2 border-[#E2E8F0] flex flex-wrap h-auto">
                  <TabsTrigger value="all" className="text-sm px-3 py-2">All Documents</TabsTrigger>
                  <TabsTrigger value="overview" className="text-sm px-3 py-2">Overview</TabsTrigger>
                  <TabsTrigger value="setup" className="text-sm px-3 py-2">Setup</TabsTrigger>
                  <TabsTrigger value="api" className="text-sm px-3 py-2">API</TabsTrigger>
                  <TabsTrigger value="full" className="text-sm px-3 py-2">Full Docs</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                  {docsLoading ? (
                    <div className="flex items-center justify-center py-12 text-[#64748B]">
                      <Loader2 className="w-8 h-8 animate-spin mr-3" />
                      Loading documentation...
                    </div>
                  ) : filteredDocs.length === 0 ? (
                    <Card className="blueprint-card p-8 sm:p-12 text-center bg-white">
                      <FileText className="w-12 h-12 text-[#CBD5E1] mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-[#0F172A]">No documentation found</h3>
                      <p className="text-[#64748B] mb-6">Start by generating an automated overview for this repository.</p>
                      <Button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="bg-[#1E3A8A] hover:bg-[#38BDF8]"
                      >
                        {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                        Generate Overview
                      </Button>
                    </Card>
                  ) : (
                    filteredDocs.map((item) => (
                      <Card
                        key={item.id}
                        className="blueprint-card p-4 sm:p-6 bg-white hover:border-[#38BDF8] transition-colors cursor-pointer"
                        onClick={() => setViewingDoc(item)}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <Badge variant="outline" className="border-2 border-[#1E3A8A] text-[#1E3A8A] uppercase text-[10px]">
                                {item.type || item.doc_type}
                              </Badge>
                              <span className="text-[#64748B] text-xs flex items-center gap-1">
                                <Calendar className="w-3 h-3" strokeWidth={1.5} />
                                {new Date(item.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <h3 className="text-base sm:text-lg font-semibold text-[#0F172A] mb-1">{item.title}</h3>
                            <p className="text-sm text-[#64748B] line-clamp-2">{item.summary || "Automated documentation generated by Infinium."}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right hidden sm:block">
                              <div className="text-xl font-bold text-[#38BDF8]">AI</div>
                              <p className="text-[#64748B] text-xs">auto</p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirm(item.id);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-2 border-t-2 border-[#E2E8F0]">
                          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-[#64748B]">
                            <span className="flex items-center gap-1">
                              <Activity className="w-3.5 h-3.5" strokeWidth={1.5} />
                              Ready for review
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-[#1E3A8A] hover:text-[#38BDF8]"
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewingDoc(item);
                            }}
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            View & Export
                          </Button>
                        </div>
                      </Card>
                    ))
                  )}
                </TabsContent>

                {/* Dynamic tab contents for each doc type */}
                {["overview", "setup", "api", "full"].map((type) => (
                  <TabsContent key={type} value={type} className="space-y-4">
                    {docsLoading ? (
                      <div className="flex items-center justify-center py-12 text-[#64748B]">
                        <Loader2 className="w-8 h-8 animate-spin mr-3" />
                        Loading documentation...
                      </div>
                    ) : filteredDocs.filter(d => d.doc_type === type).length === 0 ? (
                      <Card className="blueprint-card p-8 sm:p-12 text-center bg-white">
                        <FileText className="w-12 h-12 text-[#CBD5E1] mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-[#0F172A]">No {type} documentation</h3>
                        <p className="text-[#64748B] mb-6">Generate {type} documentation for this repository.</p>
                        <Button
                          onClick={() => {
                            setDocType(type as any);
                            handleGenerate();
                          }}
                          disabled={generating}
                          className="bg-[#1E3A8A] hover:bg-[#38BDF8]"
                        >
                          {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                          Generate {type}
                        </Button>
                      </Card>
                    ) : (
                      filteredDocs.filter(d => d.doc_type === type).map((item) => (
                        <Card
                          key={item.id}
                          className="blueprint-card p-4 sm:p-6 bg-white hover:border-[#38BDF8] transition-colors cursor-pointer"
                          onClick={() => setViewingDoc(item)}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <Badge variant="outline" className="border-2 border-[#1E3A8A] text-[#1E3A8A] uppercase text-[10px]">
                                  {item.type || item.doc_type}
                                </Badge>
                                <span className="text-[#64748B] text-xs flex items-center gap-1">
                                  <Calendar className="w-3 h-3" strokeWidth={1.5} />
                                  {new Date(item.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <h3 className="text-base sm:text-lg font-semibold text-[#0F172A] mb-1">{item.title}</h3>
                              <p className="text-sm text-[#64748B] line-clamp-2">{item.summary || `Automated ${type} documentation generated by Infinium.`}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteConfirm(item.id);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-2 border-t-2 border-[#E2E8F0]">
                            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-[#64748B]">
                              <span className="flex items-center gap-1">
                                <Activity className="w-3.5 h-3.5" strokeWidth={1.5} />
                                Ready for review
                              </span>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-[#1E3A8A] hover:text-[#38BDF8]"
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewingDoc(item);
                              }}
                            >
                              <FileText className="w-4 h-4 mr-1" />
                              View & Export
                            </Button>
                          </div>
                        </Card>
                      ))
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </div>

            {/* Sidebar - Responsive */}
            <div className="w-full lg:w-80 space-y-6">
              {/* Stats */}
              <Card className="blueprint-card p-4 sm:p-6 bg-white">
                <h3 className="text-base sm:text-lg font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
                  <div className="w-1 h-5 bg-[#1E3A8A]"></div>
                  Knowledge Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#64748B]">Indexed Repos</span>
                    <span className="text-[#0F172A] font-semibold">{repos.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#64748B]">Total Documents</span>
                    <span className="text-[#0F172A] font-semibold">{docs.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#64748B]">Generation Status</span>
                    <span className={`${generating ? 'text-[#38BDF8]' : 'text-[#22C55E]'} font-semibold flex items-center gap-2`}>
                      {generating && <Loader2 className="w-3 h-3 animate-spin" />}
                      {generating ? "Processing..." : "Ready"}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Recent Updates */}
              {recentUpdates.length > 0 && (
                <Card className="blueprint-card p-4 sm:p-6 bg-white">
                  <h3 className="text-base sm:text-lg font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
                    <div className="w-1 h-5 bg-[#1E3A8A]"></div>
                    Recent Updates
                  </h3>
                  <div className="space-y-3">
                    {recentUpdates.map((update, idx) => (
                      <div key={idx} className="p-3 border-2 border-[#E2E8F0] rounded-sm">
                        <div className="flex items-start gap-2">
                          <Activity className="w-4 h-4 text-[#38BDF8] mt-0.5" strokeWidth={1.5} />
                          <div className="flex-1">
                            <p className="text-[#0F172A] text-sm">{update.title}</p>
                            <p className="text-[#64748B] text-xs mt-1">{update.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Popular Tags */}
              {popularTags.length > 0 && (
                <Card className="blueprint-card p-4 sm:p-6 bg-white">
                  <h3 className="text-base sm:text-lg font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
                    <div className="w-1 h-5 bg-[#1E3A8A]"></div>
                    Document Types
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {popularTags.map((tag, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="bg-[#F8FAFC] text-[#64748B] border-2 border-[#E2E8F0] cursor-pointer hover:border-[#1E3A8A]"
                        onClick={() => setDocType(tag.name === "Architecture" ? "overview" : tag.name === "API Reference" ? "api" : tag.name === "Setup" ? "setup" : "full")}
                      >
                        {tag.name} ({tag.count})
                      </Badge>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Documentation Viewer Modal - Responsive */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-8 bg-[#0F172A]/80 backdrop-blur-sm overflow-hidden">
          <div className="bg-white w-full max-w-5xl h-[95vh] sm:h-[90vh] rounded-sm shadow-2xl flex flex-col relative border-2 border-[#1E3A8A]">
            {/* Modal Header */}
            <div className="bg-white border-b-2 border-[#E2E8F0] p-3 sm:p-6 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-[#1E3A8A]" />
                <div>
                  <h2 className="text-sm sm:text-xl font-bold text-[#0F172A]">{viewingDoc.title || "Project Documentation"}</h2>
                  <p className="text-[10px] sm:text-xs text-[#64748B] uppercase">{viewingDoc.doc_type} | Generated by Infinium AI</p>
                </div>
              </div>
              <div className="flex gap-2 sm:gap-3">
                <Button
                  onClick={downloadPdf}
                  variant="outline"
                  size="sm"
                  className="border-2 border-[#CBD5E1] text-[#0F172A] text-xs sm:text-sm"
                >
                  <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  PDF
                </Button>
                <Button
                  onClick={() => setViewingDoc(null)}
                  variant="ghost"
                  size="sm"
                  className="text-[#64748B] hover:text-[#EF4444]"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12 prose prose-sm sm:prose-base prose-slate max-w-none" id="kb-pdf-content">
              {viewingDoc.id === "streaming" && !viewingDoc.markdown && (
                <div className="flex flex-col items-center justify-center py-12 sm:py-20 text-[#64748B]">
                  <Loader2 className="w-8 h-8 sm:w-12 sm:h-12 animate-spin mb-4 text-[#38BDF8]" />
                  <h3 className="text-lg sm:text-xl font-semibold text-[#0F172A]">Infinium AI is writing...</h3>
                </div>
              )}

              <div className="markdown-container markdown-pdf-export">
                {viewingDoc.id === "streaming" && viewingDoc.markdown && (
                  <div className="mb-6 p-3 sm:p-4 bg-[#F0F9FF] border-2 border-[#38BDF8] rounded-sm flex items-center gap-2 sm:gap-3">
                    <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-[#38BDF8] animate-pulse" />
                    <span className="text-[#1E3A8A] font-semibold text-xs sm:text-sm uppercase tracking-wider">Live Authoring in Progress...</span>
                  </div>
                )}
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={MarkdownComponents}
                >
                  {viewingDoc.markdown || viewingDoc.content || ""}
                </ReactMarkdown>
              </div>
            </div>

            <div className="p-3 sm:p-8 border-t-2 border-[#E2E8F0] bg-gray-50 text-center">
              <p className="text-[10px] sm:text-xs text-[#64748B] italic">
                Generated on {new Date(viewingDoc.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6 bg-white shadow-2xl">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-[#0F172A]">Delete Documentation</h3>
                <p className="text-[#64748B] text-sm">Are you sure you want to delete this documentation? This action cannot be undone.</p>
              </div>
              <div className="flex gap-3 w-full pt-4">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border-2 rounded-lg font-medium text-[#64748B] hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteDoc(deleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}