import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Upload, 
  Search, 
  Maximize2, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  X
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSearchParams } from "next/navigation";
import { docsApi, Documentation } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface PdfViewerProps {
  navigateTo: (page: string) => void;
}

export function PdfViewer({ navigateTo }: PdfViewerProps) {
  const searchParams = useSearchParams();
  const docId = searchParams.get("docId");

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [doc, setDoc] = useState<Documentation | null>(null);

  // Inject html2pdf and mermaid scripts dynamically
  useEffect(() => {
    // html2pdf
    const s1 = document.createElement("script");
    s1.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
    s1.async = true;
    document.body.appendChild(s1);

    // mermaid
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
    // Re-run mermaid on doc change
    if (doc) {
      setTimeout(() => {
        // @ts-ignore
        if (window.mermaid) window.mermaid.contentLoaded();
      }, 500);
    }
  }, [doc]);

  const downloadPdf = () => {
    if (!doc) return;
    const element = document.getElementById("pdf-content");
    if (!element) return;

    const opt = {
      margin: [15, 15],
      filename: `${doc.repo_name}-analysis.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    // @ts-ignore
    window.html2pdf().set(opt).from(element).save();
  };

  useEffect(() => {
    if (docId) {
      async function loadDoc() {
        setLoading(true);
        try {
          // In a real app, we'd fetch the specific doc and generate a PDF or preview
          // For now, we'll simulate fetching the generated doc
          const { docs } = await docsApi.listDocumentation(""); 
          const found = docs.find(d => d.id === docId);
          if (found) {
            setDoc(found);
            // Simulate a "generated" PDF view
            setPreviewUrl("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf");
          }
        } catch (err) {
          console.error("Failed to load document", err);
        } finally {
          setLoading(false);
        }
      }
      loadDoc();
    }
  }, [docId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setLoading(true);
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      
      // Simulate analysis loading
      setTimeout(() => setLoading(false), 1500);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreviewUrl(null);
  };

  return (
    <div className="flex h-screen bg-white blueprint-bg">
      <Sidebar currentPage="pdf" navigateTo={navigateTo} />
      
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b-2 border-[#1E3A8A] px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-[#38BDF8]"></div>
              <div>
                <h1 className="text-3xl font-bold text-[#0F172A]">{doc?.title || "PDF Analysis Engine"}</h1>
                <p className="text-[#64748B] mt-1">{doc ? `Generated on ${new Date(doc.created_at).toLocaleDateString()}` : "Extract architectural insights from documentation"}</p>
              </div>
            </div>
            {file && (
              <div className="flex gap-3">
                <Button variant="outline" onClick={removeFile} className="border-2 border-red-200 text-red-600 hover:bg-red-50">
                  <X className="w-4 h-4 mr-2" />
                  Close Document
                </Button>
                <Button onClick={downloadPdf} className="bg-[#1E3A8A] hover:bg-[#38BDF8] text-white">
                  <Download className="w-4 h-4 mr-2" />
                  Export Analysis
                </Button>
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel: Viewer */}
          <div className="flex-1 bg-[#F8FAFC] border-r-2 border-[#E2E8F0] overflow-hidden flex flex-col">
            {!previewUrl ? (
              <div className="flex-1 flex items-center justify-center p-12">
                <div className="max-w-md w-full text-center">
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Upload className="w-10 h-10 text-[#1E3A8A]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#0F172A] mb-2">Upload Technical Document</h3>
                  <p className="text-[#64748B] mb-8">Drop your architecture diagrams, API specs, or PRDs here for AI analysis.</p>
                  
                  <label className="cursor-pointer">
                    <div className="bg-[#1E3A8A] hover:bg-[#38BDF8] text-white px-8 py-3 rounded-md font-semibold transition-colors inline-flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Select PDF File
                    </div>
                    <input type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
                  </label>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-white border-b-2 border-[#E2E8F0] p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button size="icon" variant="ghost" className="text-[#64748B]">
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <span className="text-sm font-semibold text-[#0F172A]">Page 1 of 12</span>
                    <Button size="icon" variant="ghost" className="text-[#64748B]">
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="ghost" className="text-[#64748B]">
                      <Search className="w-5 h-5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="text-[#64748B]">
                      <Maximize2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
                <div className="flex-1 overflow-auto p-8 flex justify-center bg-white">
                  <div className="w-full max-w-4xl min-h-full" id="pdf-content">
                    {doc ? (
                      <div className="prose prose-slate max-w-none prose-pre:bg-[#F8FAFC] prose-pre:border-2 prose-pre:border-[#E2E8F0] prose-pre:text-[#0F172A] blueprint-markdown markdown-pdf-export">
                        <style>{`
                          .markdown-pdf-export table {
                            width: 100%;
                            border-collapse: collapse;
                            margin: 1.5rem 0;
                            border: 2px solid #E2E8F0;
                          }
                          .markdown-pdf-export th {
                            background-color: #F8FAFC;
                            border-bottom: 2px solid #E2E8F0;
                            padding: 0.75rem;
                            text-align: left;
                            font-weight: bold;
                            color: #1E3A8A;
                          }
                          .markdown-pdf-export td {
                            border-bottom: 1px solid #E2E8F0;
                            padding: 0.75rem;
                            color: #0F172A;
                          }
                          .markdown-pdf-export tr:nth-child(even) {
                            background-color: #FDFDFD;
                          }
                          .markdown-pdf-export blockquote {
                            border-left: 4px solid #38BDF8;
                            background: #F0F9FF;
                            padding: 1rem;
                            margin: 1.5rem 0;
                          }
                          .markdown-pdf-export pre {
                            background-color: #0F172A !important;
                            color: #F8FAFC !important;
                            padding: 1.5rem !important;
                            border-radius: 4px !important;
                            overflow-x: auto !important;
                            border: 1px solid #1E293B !important;
                            margin: 2rem 0 !important;
                            white-space: pre-wrap !important;
                            word-wrap: break-word !important;
                          }
                          .markdown-pdf-export code {
                            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
                            font-size: 0.85rem !important;
                            line-height: 1.7 !important;
                          }
                          .markdown-pdf-export p {
                            margin-bottom: 1.25rem !important;
                            line-height: 1.6 !important;
                          }
                          @media print {
                            .blueprint-markdown { color: black !important; }
                            table { page-break-inside: avoid; }
                            pre { background-color: #f8f8f8 !important; color: black !important; border: 1px solid #ddd !important; }
                          }
                        `}</style>
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={MarkdownComponents}
                        >
                          {doc.markdown || doc.content || ""}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <iframe 
                        src={`${previewUrl}#toolbar=0`} 
                        className="w-full h-full border-none shadow-2xl"
                        title="PDF Preview"
                      />
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right Panel: AI Insights */}
          <aside className="w-96 bg-white overflow-y-auto">
            <div className="p-6 border-b-2 border-[#E2E8F0]">
              <h3 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#38BDF8]" />
                AI Contextual Analysis
              </h3>
            </div>

            <div className="p-6 space-y-6">
              {loading ? (
                <div className="py-20 text-center">
                  <Loader2 className="w-10 h-10 animate-spin text-[#1E3A8A] mx-auto mb-4" />
                  <p className="text-[#64748B] font-medium">Extracting knowledge...</p>
                </div>
              ) : !file ? (
                <div className="text-center py-20">
                  <p className="text-[#94A3B8] italic text-sm px-8">
                    Upload a document to see AI-extracted architectural insights and requirements.
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 border-2 border-blue-100 rounded-sm">
                      <h4 className="text-sm font-bold text-[#1E3A8A] mb-1 uppercase tracking-wider">Document Summary</h4>
                      <p className="text-sm text-[#0F172A]">{doc?.summary || "This document outlines the architectural strategy and technical requirements for the project codebase."}</p>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-[#64748B] uppercase tracking-wider blueprint-label">Key Entities Found</h4>
                      <div className="flex flex-wrap gap-2">
                        {(doc?.sources?.slice(0, 6).map(s => s.type) || ["OAuth2", "JWT", "Bcrypt", "RBAC", "Middleware", "Supabase"]).map((tag) => (
                          <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-sm border border-gray-200">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t-2 border-[#F1F5F9]">
                      <h4 className="text-sm font-bold text-[#64748B] uppercase tracking-wider blueprint-label">System Requirements</h4>
                      <div className="space-y-2">
                        <div className="flex gap-3 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] mt-1.5 shrink-0"></div>
                          <p className="text-[#0F172A]">Implement HS256 algorithm for JWT signing.</p>
                        </div>
                        <div className="flex gap-3 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] mt-1.5 shrink-0"></div>
                          <p className="text-[#0F172A]">Enforce password complexity (min 8 chars, 1 special).</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6">
                    <Button className="w-full bg-[#1E3A8A] hover:bg-[#38BDF8] text-white py-6">
                      Sync with Knowledge Base
                    </Button>
                  </div>
                </>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
