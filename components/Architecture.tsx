"use client";

import { useState, useEffect, useRef } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  GitBranch,
  Layers,
  Share2,
  Zap,
  Maximize2,
  Loader2,
  Trash2,
  Eye,
  Copy,
  CheckCircle,
  RefreshCw,
  History,
  Sparkles,
  Download
} from "lucide-react";
import { reposApi, diagramApi, type IndexedRepository, type Diagram, type DiagramType } from "@/lib/api";
import mermaid from "mermaid";

interface ArchitectureProps {
  navigateTo: (page: string) => void;
}

const diagramTypes = [
  { value: "flowchart", label: "📊 Flowchart", icon: GitBranch, description: "Code structure and module flow" },
  { value: "class", label: "🏗️ Class Diagram", icon: Layers, description: "Class relationships and inheritance" },
  { value: "sequence", label: "🔄 Sequence Diagram", icon: Share2, description: "API and interaction flow" },
  { value: "component", label: "🧩 Component Diagram", icon: Zap, description: "High-level component architecture" },
  { value: "architecture", label: "🏛️ Architecture", icon: Maximize2, description: "Complete system architecture" }
];

export function Architecture({ navigateTo }: ArchitectureProps) {
  const [repos, setRepos] = useState<IndexedRepository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>("");
  const [selectedType, setSelectedType] = useState<DiagramType>("flowchart");
  const [diagrams, setDiagrams] = useState<Diagram[]>([]);
  const [viewingDiagram, setViewingDiagram] = useState<Diagram | null>(null);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("generate");
  const [rendering, setRendering] = useState(false);
  const [svgContent, setSvgContent] = useState<string>("");
  const mermaidContainerRef = useRef<HTMLDivElement>(null);

  // Initialize mermaid
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'neutral',
      securityLevel: 'loose',
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis',
      },
    });
  }, []);

  // Load repositories
  useEffect(() => {
    loadRepos();
    loadDiagrams();
  }, []);

  // Render mermaid diagram when viewing diagram changes
  useEffect(() => {
    if (viewingDiagram && viewingDiagram.diagram_code) {
      renderMermaidDiagram(viewingDiagram.diagram_code);
    }
  }, [viewingDiagram]);

  const renderMermaidDiagram = async (code: string) => {
    setRendering(true);
    try {
      // Generate unique ID for this diagram
      const id = `mermaid-${Date.now()}`;
      
      // Render the diagram
      const { svg } = await mermaid.render(id, code);
      
      // Set SVG content
      setSvgContent(svg);
    } catch (err) {
      console.error('Failed to render mermaid diagram:', err);
      setSvgContent(`<div class="text-red-500 p-4 text-center">Failed to render diagram. Please check the syntax.</div>`);
    } finally {
      setRendering(false);
    }
  };

  // Apply SVG to DOM when svgContent changes
  useEffect(() => {
    if (svgContent && mermaidContainerRef.current) {
      mermaidContainerRef.current.innerHTML = svgContent;
    }
  }, [svgContent]);

  const loadRepos = async () => {
    try {
      const data = await reposApi.listIndexedRepos();
      const completed = data.repositories.filter(r => r.status === "completed");
      setRepos(completed);
      if (completed.length > 0 && !selectedRepo) {
        setSelectedRepo(completed[0].repo_name);
      }
    } catch (err) {
      console.error("Failed to load repos:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadDiagrams = async () => {
    try {
      const data = await diagramApi.getUserDiagrams();
      setDiagrams(data.diagrams);
    } catch (err) {
      console.error("Failed to load diagrams:", err);
    }
  };

  const handleGenerate = async () => {
    if (!selectedRepo) return;
    
    setGenerating(true);
    setError(null);
    
    try {
      const result = await diagramApi.generateDiagram({
        repo_name: selectedRepo,
        diagram_type: selectedType
      });
      await loadDiagrams();
      setViewingDiagram(result);
      setActiveTab("generate");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate diagram");
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerate = async (id: string) => {
    try {
      const result = await diagramApi.regenerateDiagram(id);
      await loadDiagrams();
      if (viewingDiagram?.id === id) {
        setViewingDiagram({ ...viewingDiagram, diagram_code: result.diagram_code });
      }
    } catch (err) {
      console.error("Failed to regenerate:", err);
    }
  };

  const handleViewDiagram = (diagram: Diagram) => {
    setViewingDiagram(diagram);
    setActiveTab("generate");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this diagram?")) return;
    try {
      await diagramApi.deleteDiagram(id);
      await loadDiagrams();
      if (viewingDiagram?.id === id) {
        setViewingDiagram(null);
        setSvgContent("");
      }
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  const handleCopy = () => {
    if (viewingDiagram?.diagram_code) {
      navigator.clipboard.writeText(viewingDiagram.diagram_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadSVG = () => {
    if (svgContent) {
      // Extract SVG from the div content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = svgContent;
      const svg = tempDiv.querySelector('svg');
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${viewingDiagram?.title || 'diagram'}.svg`;
        link.click();
        URL.revokeObjectURL(url);
      }
    }
  };

  const repoDiagrams = diagrams.filter(d => d.repo_name === selectedRepo);

  return (
    <div className="flex h-screen bg-white blueprint-bg overflow-hidden">
      <Sidebar currentPage="architecture" navigateTo={navigateTo} />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b-2 border-[#1E3A8A] px-4 sm:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 sm:h-8 bg-[#38BDF8]"></div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">Architecture Visualizer</h1>
                <p className="text-sm text-[#64748B] mt-1">AI-powered code architecture diagrams</p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Repository Selector */}
            <Card className="blueprint-card p-4 bg-white">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="w-full sm:w-64">
                  <select
                    value={selectedRepo}
                    onChange={(e) => setSelectedRepo(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border-2 border-[#CBD5E1] focus:border-[#38BDF8] focus:outline-none text-sm"
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
                <div className="flex-1 flex flex-wrap gap-2">
                  {diagramTypes.map((type) => (
                    <Button
                      key={type.value}
                      size="sm"
                      onClick={() => setSelectedType(type.value as DiagramType)}
                      className={`${
                        selectedType === type.value
                          ? "bg-[#1E3A8A] text-white"
                          : "bg-white text-[#64748B] border-2 border-[#CBD5E1] hover:border-[#1E3A8A]"
                      }`}
                    >
                      {type.label}
                    </Button>
                  ))}
                </div>
                <Button
                  onClick={handleGenerate}
                  disabled={generating || !selectedRepo}
                  className="bg-[#1E3A8A] hover:bg-[#38BDF8] text-white whitespace-nowrap"
                >
                  {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                  Generate
                </Button>
              </div>
              <p className="text-xs text-[#64748B] mt-3">
                {diagramTypes.find(t => t.value === selectedType)?.description}
              </p>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-white border-2 border-[#E2E8F0] mb-6">
                <TabsTrigger value="generate">✨ Diagram Viewer</TabsTrigger>
                <TabsTrigger value="history">📚 Saved Diagrams ({repoDiagrams.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="generate" className="mt-0">
                {viewingDiagram ? (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-[#E2E8F0]">
                      <div>
                        <h3 className="text-lg font-semibold text-[#0F172A]">{viewingDiagram.title}</h3>
                        <p className="text-sm text-[#64748B]">{viewingDiagram.description}</p>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Button size="sm" variant="outline" onClick={handleCopy}>
                          {copied ? <CheckCircle className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
                          {copied ? "Copied!" : "Copy Code"}
                        </Button>
                        {svgContent && (
                          <Button size="sm" variant="outline" onClick={handleDownloadSVG}>
                            <Download className="w-4 h-4 mr-2" />
                            Download SVG
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => handleRegenerate(viewingDiagram.id)}>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Regenerate
                        </Button>
                      </div>
                    </div>
                    
                    <Card className="blueprint-card p-6 bg-white">
                      {rendering ? (
                        <div className="flex items-center justify-center py-20">
                          <Loader2 className="w-8 h-8 animate-spin text-[#1E3A8A]" />
                          <span className="ml-3 text-[#64748B]">Rendering diagram...</span>
                        </div>
                      ) : (
                        <div 
                          ref={mermaidContainerRef}
                          className="bg-[#F8FAFC] p-6 rounded-lg overflow-x-auto overflow-y-auto min-h-[500px] max-h-[70vh] flex justify-center"
                        />
                      )}
                    </Card>
                    
                    {/* Show raw code for reference */}
                    <details className="text-sm">
                      <summary className="cursor-pointer text-[#64748B] hover:text-[#1E3A8A]">View Mermaid Code</summary>
                      <pre className="mt-2 p-4 bg-[#F8FAFC] rounded-lg overflow-x-auto text-xs whitespace-pre-wrap">
                        {viewingDiagram.diagram_code}
                      </pre>
                    </details>
                  </div>
                ) : (
                  <Card className="blueprint-card p-12 text-center bg-white">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <GitBranch className="w-10 h-10 text-[#1E3A8A]" />
                    </div>
                    <h3 className="text-xl font-bold text-[#0F172A] mb-2">Generate Architecture Diagram</h3>
                    <p className="text-[#64748B] mb-6">Select a repository and diagram type to generate an AI-powered architecture visualization</p>
                    <Button onClick={handleGenerate} disabled={generating || !selectedRepo} className="bg-[#1E3A8A]">
                      {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                      Generate Now
                    </Button>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="history" className="mt-0">
                {repoDiagrams.length === 0 ? (
                  <Card className="blueprint-card p-12 text-center bg-white">
                    <History className="w-12 h-12 text-[#CBD5E1] mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-[#0F172A]">No diagrams yet</h3>
                    <p className="text-[#64748B]">Generate your first architecture diagram for this repository</p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {repoDiagrams.map((diagram) => (
                      <Card key={diagram.id} className="blueprint-card p-4 bg-white hover:border-[#38BDF8] transition-all">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 cursor-pointer" onClick={() => handleViewDiagram(diagram)}>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="border-[#1E3A8A] text-[#1E3A8A]">
                                {diagram.diagram_type}
                              </Badge>
                              <span className="text-xs text-[#64748B]">{new Date(diagram.created_at).toLocaleDateString()}</span>
                            </div>
                            <h4 className="font-semibold text-[#0F172A]">{diagram.title}</h4>
                            <p className="text-sm text-[#64748B] mt-1 line-clamp-2">{diagram.description}</p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewDiagram(diagram)}
                              className="text-[#38BDF8]"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRegenerate(diagram.id)}
                              className="text-[#1E3A8A]"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(diagram.id)}
                              className="text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {error && (
              <div className="rounded-md border-2 border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
