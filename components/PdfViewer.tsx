"use client";

import { useEffect, useState, useRef } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Upload,
  Loader2,
  X,
  Copy,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Trash2,
  Clock,
  Eye,
  History
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { pdfApi, type PdfAnalysis } from "@/lib/api";

interface PdfViewerProps {
  navigateTo: (page: string) => void;
}

export function PdfViewer({ navigateTo }: PdfViewerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<PdfAnalysis | null>(null);
  const [history, setHistory] = useState<PdfAnalysis[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch analysis history on load
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await pdfApi.getAnalysisHistory();
      setHistory(data.analyses);
    } catch (err) {
      console.error('Failed to fetch history:', err);
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setError(null);
      setAnalysis(null);
    } else {
      setError("Please select a valid PDF file");
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setAnalyzing(true);
    setError(null);

    try {
      const result = await pdfApi.analyzePdf(file);
      setAnalysis(result);
      setFile(null);
      fetchHistory(); // Refresh history
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDeleteAnalysis = async (id: string) => {
    if (!confirm("Delete this analysis?")) return;

    try {
      await pdfApi.deleteAnalysis(id);
      fetchHistory();
      if (analysis?.id === id) {
        setAnalysis(null);
      }
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const handleViewAnalysis = (analysisItem: PdfAnalysis) => {
    setAnalysis(analysisItem);
    setShowHistory(false);
    setFile(null);
  };

  const handleCopyAnalysis = () => {
    if (analysis?.fullAnalysis) {
      navigator.clipboard.writeText(analysis.fullAnalysis);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Helper function to format analysis text
  const formatAnalysisText = (text: string) => {
    if (!text) return "";

    // Replace literal \n with actual newlines
    let formatted = text.replace(/\\n/g, '\n');

    // Ensure proper markdown headers have spacing
    formatted = formatted.replace(/([^\n])(## )/g, '$1\n\n$2');
    formatted = formatted.replace(/([^\n])(### )/g, '$1\n\n$2');

    // Ensure bullet points have proper line breaks
    formatted = formatted.replace(/([^\n])(\* )/g, '$1\n$2');
    formatted = formatted.replace(/([^\n])(- )/g, '$1\n$2');

    // Ensure numbered lists have proper line breaks
    formatted = formatted.replace(/([^\n])(\d+\. )/g, '$1\n$2');

    return formatted;
  };

  return (
    <div className="flex h-screen bg-white blueprint-bg overflow-hidden">
      <Sidebar currentPage="pdf" navigateTo={navigateTo} />

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b-2 border-[#1E3A8A] px-4 sm:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 sm:h-8 bg-[#38BDF8]"></div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">PDF Intelligence Engine</h1>
                <p className="text-sm text-[#64748B] mt-1">AI-powered document analysis and insights</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowHistory(!showHistory)}
                variant="outline"
                className="border-2 border-[#CBD5E1] text-[#0F172A] hover:border-[#1E3A8A]"
              >
                {showHistory ? <Sparkles className="w-4 h-4 mr-2" /> : <History className="w-4 h-4 mr-2" />}
                {showHistory ? "New Analysis" : "History"}
              </Button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          {showHistory ? (
            // History View
            <div className="max-w-4xl mx-auto space-y-6">
              <h2 className="text-xl font-semibold text-[#0F172A] flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#38BDF8]" />
                Your Analysis History
              </h2>

              {loadingHistory ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-[#1E3A8A]" />
                </div>
              ) : history.length === 0 ? (
                <Card className="blueprint-card p-12 text-center bg-white">
                  <FileText className="w-12 h-12 text-[#CBD5E1] mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-[#0F172A]">No analyses yet</h3>
                  <p className="text-[#64748B] mt-2">Upload a PDF to get AI-powered insights</p>
                  <Button
                    onClick={() => setShowHistory(false)}
                    className="mt-6 bg-[#1E3A8A] hover:bg-[#38BDF8]"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Analyze Document
                  </Button>
                </Card>
              ) : (
                <div className="space-y-3">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleViewAnalysis(item)}
                      className="bg-white border-2 border-[#E2E8F0] rounded-lg p-4 hover:border-[#38BDF8] transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-10 h-10 bg-[#F1F5FF] rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-[#1E3A8A]" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-[#0F172A] truncate">{item.file_name}</h3>
                            <div className="flex flex-wrap items-center gap-3 mt-1">
                              <span className="text-xs text-[#64748B]">{formatFileSize(item.file_size)}</span>
                              <span className="text-xs text-[#64748B]">{formatDate(item.created_at)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-[#1E3A8A]"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewAnalysis(item);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAnalysis(item.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : analysis ? (
            // Analysis Result View
            <div className="max-w-5xl mx-auto space-y-6">
              {/* Analysis Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-[#E2E8F0]">
                <div>
                  <h2 className="text-xl font-bold text-[#0F172A]">{analysis.file_name}</h2>
                  <p className="text-sm text-[#64748B]">Analyzed on {formatDate(analysis.created_at)}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleCopyAnalysis}
                    variant="outline"
                    className="border-2 border-[#CBD5E1]"
                  >
                    {copied ? <CheckCircle className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                  <Button onClick={() => setAnalysis(null)} variant="outline" className="border-2 border-[#CBD5E1]">
                    New Analysis
                  </Button>
                </div>
              </div>

              {/* Summary Card */}
              <Card className="blueprint-card p-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-6 h-6 text-[#38BDF8] flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-[#0F172A] mb-2">AI Executive Summary</h3>
                    <p className="text-[#0F172A] leading-relaxed">{analysis.summary}</p>
                  </div>
                </div>
              </Card>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {analysis.keyEntities.length > 0 && (
                  <Card className="blueprint-card p-4 bg-white">
                    <h3 className="text-sm font-semibold text-[#64748B] uppercase mb-3">Key Entities</h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.keyEntities.map((entity: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-[#F1F5FF] text-[#1E3A8A] text-xs font-medium rounded-md">
                          {entity}
                        </span>
                      ))}
                    </div>
                  </Card>
                )}

                {analysis.technologies.length > 0 && (
                  <Card className="blueprint-card p-4 bg-white">
                    <h3 className="text-sm font-semibold text-[#64748B] uppercase mb-3">Technologies Detected</h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.technologies.map((tech: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-[#FEF3C7] text-[#D97706] text-xs font-medium rounded-md">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </Card>
                )}
              </div>

              {/* Requirements & Recommendations */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {analysis.requirements.length > 0 && (
                  <Card className="blueprint-card p-5 bg-white">
                    <h3 className="font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
                      <div className="w-1 h-5 bg-[#EF4444]"></div>
                      Requirements
                    </h3>
                    <ul className="space-y-2">
                      {analysis.requirements.map((req: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-[#64748B]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] mt-2 flex-shrink-0"></span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {analysis.recommendations.length > 0 && (
                  <Card className="blueprint-card p-5 bg-white">
                    <h3 className="font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
                      <div className="w-1 h-5 bg-[#10B981]"></div>
                      Recommendations
                    </h3>
                    <ul className="space-y-2">
                      {analysis.recommendations.map((rec: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-[#64748B]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] mt-2 flex-shrink-0"></span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}
              </div>

              {/* Full Analysis */}
              <Card className="blueprint-card p-6 bg-white">
                <h3 className="font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
                  <div className="w-1 h-5 bg-[#38BDF8]"></div>
                  Detailed Analysis
                </h3>
                <div className="prose prose-slate max-w-none prose-pre:bg-[#0F172A] prose-pre:text-white">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {formatAnalysisText(analysis.fullAnalysis)}
                  </ReactMarkdown>
                </div>
              </Card>
            </div>
          ) : (
            // Upload View
            <div className="max-w-md mx-auto">
              <Card className="blueprint-card p-8 bg-white text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Upload className="w-10 h-10 text-[#1E3A8A]" />
                </div>
                <h3 className="text-xl font-bold text-[#0F172A] mb-2">Upload Technical Document</h3>
                <p className="text-[#64748B] mb-8">Upload PDFs of architecture docs, API specs, PRDs, or technical papers for AI analysis</p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {!file ? (
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-[#1E3A8A] hover:bg-[#38BDF8] text-white px-8 py-6 text-lg"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Select PDF File
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-lg border-2 border-[#E2E8F0]">
                      <div className="flex items-center gap-3">
                        <FileText className="w-8 h-8 text-[#1E3A8A]" />
                        <div className="text-left">
                          <p className="font-medium text-[#0F172A] truncate max-w-[200px]">{file.name}</p>
                          <p className="text-xs text-[#64748B]">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setFile(null)}
                        className="text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 border-2 border-red-200 rounded-lg text-red-700 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                      </div>
                    )}

                    <Button
                      onClick={handleAnalyze}
                      disabled={analyzing}
                      className="w-full bg-[#1E3A8A] hover:bg-[#38BDF8] text-white py-6"
                    >
                      {analyzing ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Analyzing Document...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          Analyze with AI
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}