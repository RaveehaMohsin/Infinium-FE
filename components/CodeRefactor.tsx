"use client";

import { useEffect, useMemo, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  ChevronDown,
  FolderOpen,
  Folder,
  FileCode,
  Wand2,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  RefreshCw,
  Copy,
  Check,
} from "lucide-react";
import {
  reposApi,
  refactorApi,
  IndexedRepository,
} from "@/lib/api";
import {
  RepoTree,
  RepoTreeFile,
  RepoFile,
  RepoSymbol,
  RefactorResult,
  Granularity,
} from "@/lib/api/refactor";

interface Props {
  navigateTo: (page: string) => void;
}

interface TreeNode {
  name: string;
  path: string;          // full path; "" for root
  isFile: boolean;
  language?: string;
  symbols?: RepoSymbol[];
  children: Map<string, TreeNode>;
}

function buildTree(files: RepoTreeFile[]): TreeNode {
  const root: TreeNode = { name: "", path: "", isFile: false, children: new Map() };
  for (const f of files) {
    const parts = f.path.split("/");
    let node = root;
    parts.forEach((part, idx) => {
      const isFile = idx === parts.length - 1;
      const path = parts.slice(0, idx + 1).join("/");
      if (!node.children.has(part)) {
        node.children.set(part, {
          name: part,
          path,
          isFile,
          language: isFile ? f.language : undefined,
          symbols: isFile ? f.symbols : undefined,
          children: new Map(),
        });
      }
      node = node.children.get(part)!;
    });
  }
  return root;
}

interface RowProps {
  node: TreeNode;
  depth: number;
  expanded: Set<string>;
  toggle: (path: string) => void;
  onPickFile: (path: string) => void;
  onPickSymbol: (path: string, sym: RepoSymbol) => void;
  selectedPath: string;
  selectedSymbol: string;
}

function TreeRow({
  node,
  depth,
  expanded,
  toggle,
  onPickFile,
  onPickSymbol,
  selectedPath,
  selectedSymbol,
}: RowProps) {
  const isOpen = expanded.has(node.path);
  const indent = { paddingLeft: 8 + depth * 14 };

  if (node.isFile) {
    const isSelected = selectedPath === node.path;
    const symbolsOpen = expanded.has(`sym:${node.path}`);
    const symCount = node.symbols?.length || 0;
    return (
      <>
        <div
          style={indent}
          onClick={() => {
            onPickFile(node.path);
            // Always toggle — even if no symbols (so user gets visual feedback
            // about what a file contains).
            toggle(`sym:${node.path}`);
          }}
          className={`flex items-center gap-1 py-1 px-2 cursor-pointer text-sm rounded-sm ${
            isSelected
              ? "bg-[#1E3A8A]/10 text-[#1E3A8A]"
              : "hover:bg-[#F1F5F9] text-[#0F172A]"
          }`}
        >
          {symCount > 0 ? (
            symbolsOpen ? (
              <ChevronDown className="w-3 h-3 shrink-0 text-[#64748B]" />
            ) : (
              <ChevronRight className="w-3 h-3 shrink-0 text-[#64748B]" />
            )
          ) : (
            <span className="w-3 h-3 shrink-0" />
          )}
          <FileCode className="w-4 h-4 shrink-0 text-[#38BDF8]" strokeWidth={1.5} />
          <span className="truncate flex-1">{node.name}</span>
          {symCount > 0 && (
            <span className="text-[10px] text-[#94A3B8] shrink-0 ml-1">
              {symCount}
            </span>
          )}
        </div>
        {symbolsOpen && symCount === 0 && (
          <div
            style={{ paddingLeft: 8 + (depth + 1) * 14 + 18 }}
            className="text-[10px] text-[#94A3B8] py-0.5 px-2 italic"
          >
            no functions detected — refactor will use whole file
          </div>
        )}
        {symbolsOpen &&
          node.symbols?.map((s) => {
            const isSelSym = isSelected && selectedSymbol === s.name;
            return (
              <div
                key={`${node.path}::${s.name}::${s.start}`}
                style={{ paddingLeft: 8 + (depth + 1) * 14 + 18 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onPickSymbol(node.path, s);
                }}
                className={`flex items-center gap-2 py-0.5 px-2 cursor-pointer text-xs rounded-sm ${
                  isSelSym
                    ? "bg-[#38BDF8]/15 text-[#0369A1]"
                    : "hover:bg-[#F1F5F9] text-[#475569]"
                }`}
              >
                <span
                  className={`px-1 rounded text-[9px] uppercase tracking-wide ${
                    s.kind === "class"
                      ? "bg-[#FACC15]/30 text-[#854D0E]"
                      : "bg-[#1E3A8A]/15 text-[#1E3A8A]"
                  }`}
                >
                  {s.kind === "class" ? "C" : "f"}
                </span>
                <span className="truncate font-mono">{s.name}</span>
              </div>
            );
          })}
      </>
    );
  }

  // Folder
  const children = Array.from(node.children.values()).sort((a, b) => {
    if (a.isFile !== b.isFile) return a.isFile ? 1 : -1;
    return a.name.localeCompare(b.name);
  });
  return (
    <>
      {node.path !== "" && (
        <div
          style={indent}
          onClick={() => toggle(node.path)}
          className="flex items-center gap-1 py-1 px-2 cursor-pointer text-sm rounded-sm hover:bg-[#F1F5F9] text-[#0F172A]"
        >
          {isOpen ? (
            <ChevronDown className="w-3 h-3 shrink-0 text-[#64748B]" />
          ) : (
            <ChevronRight className="w-3 h-3 shrink-0 text-[#64748B]" />
          )}
          {isOpen ? (
            <FolderOpen className="w-4 h-4 shrink-0 text-[#1E3A8A]" strokeWidth={1.5} />
          ) : (
            <Folder className="w-4 h-4 shrink-0 text-[#1E3A8A]" strokeWidth={1.5} />
          )}
          <span className="truncate">{node.name}</span>
        </div>
      )}
      {(node.path === "" || isOpen) &&
        children.map((c) => (
          <TreeRow
            key={c.path || c.name}
            node={c}
            depth={node.path === "" ? depth : depth + 1}
            expanded={expanded}
            toggle={toggle}
            onPickFile={onPickFile}
            onPickSymbol={onPickSymbol}
            selectedPath={selectedPath}
            selectedSymbol={selectedSymbol}
          />
        ))}
    </>
  );
}

// ── Rich code viewer with line numbers + (optional) range highlight ──

function CodeViewer({
  content,
  highlightStart,
  highlightEnd,
}: {
  content: string;
  language?: string;
  highlightStart?: number;
  highlightEnd?: number;
}) {
  const lines = content.split("\n");
  return (
    <div className="font-mono text-[12px] leading-[1.55] bg-[#0B1220] text-[#E2E8F0]">
      <table className="border-collapse w-full">
        <tbody>
          {lines.map((line, i) => {
            const lineNum = i + 1;
            const inHighlight =
              highlightStart !== undefined &&
              highlightEnd !== undefined &&
              i >= highlightStart &&
              i < highlightEnd;
            return (
              <tr
                key={i}
                className={inHighlight ? "bg-[#1E3A8A]/30" : ""}
              >
                <td className="select-none text-right px-3 py-[1px] text-[#475569] border-r border-[#1F2937] w-12 align-top">
                  {lineNum}
                </td>
                <td className="px-3 py-[1px] whitespace-pre">{line || " "}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Side-by-side diff with line numbers, color bands per hunk ──

interface DiffLine {
  kind: "header" | "hunk" | "add" | "del" | "ctx" | "meta";
  text: string;
}

function parseDiff(diff: string): DiffLine[] {
  return diff.split("\n").map((text) => {
    if (text.startsWith("@@")) return { kind: "hunk" as const, text };
    if (text.startsWith("+++") || text.startsWith("---")) return { kind: "header" as const, text };
    if (text.startsWith("+")) return { kind: "add" as const, text };
    if (text.startsWith("-")) return { kind: "del" as const, text };
    if (text.startsWith("diff ") || text.startsWith("index "))
      return { kind: "meta" as const, text };
    return { kind: "ctx" as const, text };
  });
}

function DiffView({ diff }: { diff: string }) {
  const lines = parseDiff(diff);

  const adds = lines.filter((l) => l.kind === "add").length;
  const dels = lines.filter((l) => l.kind === "del").length;

  return (
    <div className="border border-[#1F2937] rounded-md overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#0F172A] text-[11px] text-[#94A3B8]">
        <span>Unified diff</span>
        <span className="flex items-center gap-3">
          <span className="text-[#4ADE80]">+{adds}</span>
          <span className="text-[#F87171]">−{dels}</span>
        </span>
      </div>
      <div className="bg-[#0B1220] text-[#E2E8F0] font-mono text-[12px] leading-[1.55]">
        <table className="border-collapse w-full">
          <tbody>
            {lines.map((l, i) => {
              if (l.kind === "header" || l.kind === "meta") return null;
              const bg =
                l.kind === "add"
                  ? "bg-[#052e16]/70"
                  : l.kind === "del"
                  ? "bg-[#450a0a]/70"
                  : l.kind === "hunk"
                  ? "bg-[#1E3A8A]/30"
                  : "";
              const fg =
                l.kind === "add"
                  ? "text-[#86efac]"
                  : l.kind === "del"
                  ? "text-[#fca5a5]"
                  : l.kind === "hunk"
                  ? "text-[#7dd3fc]"
                  : "text-[#cbd5e1]";
              const sign =
                l.kind === "add" ? "+" : l.kind === "del" ? "−" : l.kind === "hunk" ? "@" : " ";
              const lineText = l.kind === "hunk" ? l.text : l.text.slice(1);
              return (
                <tr key={i} className={bg}>
                  <td className="select-none w-6 text-center text-[#475569] px-1 align-top">
                    {sign}
                  </td>
                  <td className={`${fg} whitespace-pre px-2 py-[1px]`}>
                    {lineText || " "}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function CodeRefactor({ navigateTo }: Props) {
  const [repos, setRepos] = useState<IndexedRepository[]>([]);
  const [activeRepo, setActiveRepo] = useState<string>("");
  const [tree, setTree] = useState<RepoTree | null>(null);
  const [treeLoading, setTreeLoading] = useState(false);

  const [selectedPath, setSelectedPath] = useState<string>("");
  const [selectedSymbol, setSelectedSymbol] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<RepoFile | null>(null);
  const [fileLoading, setFileLoading] = useState(false);

  const [granularity, setGranularity] = useState<Granularity>("function");
  const [instruction, setInstruction] = useState<string>("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RefactorResult | null>(null);

  const [expanded, setExpanded] = useState<Set<string>>(new Set([""]));
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const [copied, setCopied] = useState(false);
  const [reposError, setReposError] = useState<string | null>(null);
  const [treeError, setTreeError] = useState<string | null>(null);

  // Load indexed repos once. Use the SAME endpoint Repositories.tsx uses
  // (listAllRepos) and filter for indexed ones — this matches what users
  // see on the Repositories page.
  useEffect(() => {
    (async () => {
      try {
        // Try listIndexedRepos first; if empty, fall back to listAllRepos
        // and filter to is_indexed/has_branch_index.
        const indexed = await reposApi.listIndexedRepos();
        let list: IndexedRepository[] = indexed.repositories || [];
        if (list.length === 0) {
          try {
            const all = await reposApi.listAllRepos();
            // Map the listAllRepos shape to IndexedRepository-ish entries we use.
            list = (all.repositories || [])
              .filter((r) => r.is_indexed || r.has_branch_index)
              .map((r) => ({
                id: String(r.id),
                repo_name: r.name,
                repo_url: r.html_url || "",
                full_name: r.full_name || r.name,
                owner_github_id: 0,
                status: (r.indexing_status || "completed") as IndexedRepository["status"],
                is_private: !!r.private,
                default_branch: r.default_branch || "main",
                language: r.language || null,
                stars: r.stars || 0,
                chunks_count: r.chunks_count || 0,
                files_count: 0,
                commits_count: 0,
                indexed_at: r.indexed_at || null,
                error_message: null,
                created_at: "",
                updated_at: "",
                indexed_branches: r.indexed_branches || [r.default_branch || "main"],
                has_branch_index: r.has_branch_index,
              }));
          } catch {
            /* ignore — we'll show whatever indexed had */
          }
        }
        setRepos(list);
        setReposError(list.length === 0 ? "No indexed repositories yet. Ingest one from the Repositories page first." : null);
        if (list.length > 0) setActiveRepo(list[0].repo_name);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to load repositories";
        setReposError(msg);
        console.error("CodeRefactor: listIndexedRepos failed:", err);
      }
    })();
  }, []);

  // Load tree when repo changes. Pass the repo_url along so the backend can
  // auto-clone if repo_cache/ is empty for this repo (happens for repos
  // ingested via the public/tarball path).
  useEffect(() => {
    if (!activeRepo) return;
    setTreeLoading(true);
    setSelectedPath("");
    setSelectedSymbol("");
    setSelectedFile(null);
    setResult(null);
    setTreeError(null);
    const repoMeta = repos.find((r) => r.repo_name === activeRepo);
    const repoUrl = repoMeta?.repo_url || undefined;
    refactorApi
      .getRepoTree(activeRepo, repoUrl)
      .then((t) => {
        setTree(t);
        // Debug: how many files have symbols? Helps diagnose "no functions
        // showing" — if total is high but withSymbols is 0, it's a Python-side
        // chunker issue, not the FE.
        const withSymbols = (t?.files || []).filter(
          (f) => (f.symbols || []).length > 0
        ).length;
        const totalSymbols = (t?.files || []).reduce(
          (acc, f) => acc + (f.symbols?.length || 0),
          0
        );
        console.log(
          `[CodeRefactor] tree loaded: ${t?.total || 0} files, ` +
            `${withSymbols} with symbols, ${totalSymbols} symbols total`
        );
        if (t?.files?.length) {
          const sample = t.files.find((f) => (f.symbols || []).length > 0);
          if (sample) {
            console.log(
              `[CodeRefactor] sample file with symbols:`,
              sample.path,
              sample.symbols
            );
          } else {
            console.log(
              `[CodeRefactor] no file has symbols. Sample file:`,
              t.files[0]
            );
          }
        }
        if (!t || t.total === 0) {
          setTreeError(
            "Tree is empty. The repo isn't cloned on disk in `repo_cache/` — " +
              "this happens when you ingested via the public/tarball path. Re-ingest using the clone path to enable refactor."
          );
        }
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : "Failed to load tree";
        setTree(null);
        setTreeError(msg);
        console.error("CodeRefactor: getRepoTree failed:", err);
      })
      .finally(() => setTreeLoading(false));
    // Don't react to repos[] — using ref-like lookup, harmless to re-run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRepo]);

  // Load file content when selectedPath changes
  useEffect(() => {
    if (!activeRepo || !selectedPath) {
      setSelectedFile(null);
      return;
    }
    setFileLoading(true);
    const repoMeta = repos.find((r) => r.repo_name === activeRepo);
    const repoUrl = repoMeta?.repo_url || undefined;
    refactorApi
      .getRepoFile(activeRepo, selectedPath, repoUrl)
      .then(setSelectedFile)
      .catch(() => setSelectedFile(null))
      .finally(() => setFileLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRepo, selectedPath]);

  const root = useMemo(
    () => (tree ? buildTree(tree.files) : null),
    [tree]
  );

  const toggleNode = (p: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });
  };

  const onPickFile = (path: string) => {
    setSelectedPath(path);
    setSelectedSymbol("");
    setGranularity("file");
    setResult(null);
  };

  const onPickSymbol = (path: string, sym: RepoSymbol) => {
    setSelectedPath(path);
    setSelectedSymbol(sym.name);
    setGranularity("function");
    setResult(null);
  };

  const selectedSymbolCode = useMemo(() => {
    if (!selectedFile || !selectedSymbol) return "";
    const sym = selectedFile.symbols.find((s) => s.name === selectedSymbol);
    if (!sym) return "";
    const lines = selectedFile.content.split("\n");
    return lines.slice(sym.start, sym.end).join("\n");
  }, [selectedFile, selectedSymbol]);

  const runRefactor = async () => {
    if (!activeRepo || !selectedPath || !instruction.trim() || running) return;
    setRunning(true);
    setResult(null);
    setFeedback(null);
    try {
      const payload =
        granularity === "function"
          ? {
              repo_name: activeRepo,
              granularity,
              target: selectedSymbol || selectedPath,
              file: selectedPath,
              code: selectedSymbolCode || undefined,
              instruction,
            }
          : {
              repo_name: activeRepo,
              granularity,
              target: selectedPath,
              instruction,
            };
      const data = await refactorApi.refactor(payload);
      setResult(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Refactor failed";
      setResult({ found: false, reason: message });
    } finally {
      setRunning(false);
    }
  };

  const sendFeedback = async (rating: 1 | 5) => {
    if (!result || feedback) return;
    setFeedback(rating === 5 ? "up" : "down");
    try {
      await refactorApi.submitFeedback({
        target_type: "refactor",
        target_id: `${activeRepo}:${selectedPath}:${selectedSymbol || "_file"}`,
        query: instruction,
        answer: result.after || "",
        rating,
        repo_name: activeRepo,
        metadata: {
          granularity,
          model: result.model,
          duration_ms: result.duration_ms,
          tokens: result.tokens,
        },
      });
    } catch {
      /* swallow — feedback is best-effort */
    }
  };

  const copyAfter = async () => {
    if (!result?.after) return;
    try {
      await navigator.clipboard.writeText(result.after);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* noop */
    }
  };

  const canRun =
    !!activeRepo &&
    !!selectedPath &&
    instruction.trim().length > 0 &&
    !running &&
    (granularity === "file" || !!selectedSymbol);

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      <Sidebar currentPage="code-refactor" navigateTo={navigateTo} />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b-2 border-[#E2E8F0] bg-white flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#0F172A] flex items-center gap-2">
              <Wand2 className="w-6 h-6 text-[#1E3A8A]" strokeWidth={1.5} />
              Code Refactor Agent
            </h1>
            <p className="text-sm text-[#64748B] mt-0.5">
              Pick a function or whole file, describe the change, get a diff back.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={activeRepo}
              onChange={(e) => setActiveRepo(e.target.value)}
              className="border-2 border-[#CBD5E1] rounded-sm px-3 py-1.5 text-sm bg-white focus:border-[#1E3A8A] outline-none"
            >
              <option value="">Select repository…</option>
              {repos.map((r) => (
                <option key={r.repo_name} value={r.repo_name}>
                  {r.repo_name}
                </option>
              ))}
            </select>
            <Button
              onClick={() => activeRepo && setActiveRepo(activeRepo)}
              variant="ghost"
              size="sm"
              className="text-[#64748B] hover:text-[#1E3A8A]"
              title="Refresh tree"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* 3-pane body */}
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT: tree */}
          <div className="w-72 border-r-2 border-[#E2E8F0] bg-white overflow-y-auto">
            {!activeRepo ? (
              <div className="p-6 text-sm text-center">
                {reposError ? (
                  <div className="text-[#B45309] bg-[#FEF3C7] border border-[#FCD34D] rounded-sm p-3 text-left">
                    {reposError}
                  </div>
                ) : (
                  <span className="text-[#64748B]">Select a repository above.</span>
                )}
              </div>
            ) : treeLoading ? (
              <div className="p-6 flex items-center justify-center text-[#64748B]">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : !tree || tree.total === 0 ? (
              <div className="p-6 text-sm">
                <div className="text-[#B45309] bg-[#FEF3C7] border border-[#FCD34D] rounded-sm p-3">
                  {treeError || "No files visible. The repo isn't cloned in repo_cache/ yet."}
                </div>
              </div>
            ) : (
              <div className="p-2">
                <div className="text-[10px] uppercase tracking-wide text-[#64748B] px-2 py-1">
                  {tree.total} files
                </div>
                {root && (
                  <TreeRow
                    node={root}
                    depth={0}
                    expanded={expanded}
                    toggle={toggleNode}
                    onPickFile={onPickFile}
                    onPickSymbol={onPickSymbol}
                    selectedPath={selectedPath}
                    selectedSymbol={selectedSymbol}
                  />
                )}
              </div>
            )}
          </div>

          {/* MIDDLE: viewer + diff (single scroll for the whole column so
              long files aren't clipped behind a nested scrollbar) */}
          <div className="flex-1 flex flex-col overflow-auto">
            <div className="bg-[#F8FAFC] p-4">
              {!selectedPath ? (
                <div className="flex items-center justify-center min-h-[40vh] text-[#64748B] text-sm">
                  Select a file or function from the tree.
                </div>
              ) : fileLoading ? (
                <div className="flex items-center justify-center h-full text-[#64748B]">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              ) : !selectedFile ? (
                <div className="text-sm text-[#EF4444]">Failed to load file.</div>
              ) : (() => {
                const activeSym = selectedSymbol
                  ? selectedFile.symbols.find((s) => s.name === selectedSymbol)
                  : undefined;
                const showWholeFile = !selectedSymbol || !activeSym;
                const displayContent = showWholeFile
                  ? selectedFile.content
                  : selectedSymbolCode;
                const lineCount = displayContent.split("\n").length;
                return (
                  <div className="rounded-md overflow-hidden shadow-sm border border-[#1F2937]">
                    <div className="flex items-center justify-between px-3 py-2 bg-[#0F172A] text-[#E2E8F0]">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileCode className="w-4 h-4 shrink-0 text-[#38BDF8]" strokeWidth={1.5} />
                        <span className="font-mono text-xs truncate">{selectedFile.path}</span>
                        {activeSym && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#38BDF8]/20 text-[#7dd3fc] font-mono">
                            {activeSym.kind === "class" ? "class " : "fn "}
                            {activeSym.name}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#94A3B8] font-mono shrink-0 ml-3">
                        {lineCount} lines · {selectedFile.symbols.length} symbols
                      </div>
                    </div>
                    <CodeViewer
                      content={displayContent}
                      language={selectedFile.language}
                      highlightStart={
                        showWholeFile && activeSym ? activeSym.start : undefined
                      }
                      highlightEnd={
                        showWholeFile && activeSym ? activeSym.end : undefined
                      }
                    />
                  </div>
                );
              })()}
            </div>

            {/* Result diff */}
            {result && (
              <div className="border-t-2 border-[#E2E8F0] bg-white p-4 space-y-3">
                {!result.found ? (
                  <div className="text-sm text-[#EF4444]">
                    {result.reason || result.error || "Refactor failed."}
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-[#0F172A]">
                        Suggested change
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={copyAfter}
                          variant="ghost"
                          size="sm"
                          className="text-[#64748B] hover:text-[#1E3A8A]"
                        >
                          {copied ? (
                            <Check className="w-4 h-4 mr-1" />
                          ) : (
                            <Copy className="w-4 h-4 mr-1" />
                          )}
                          {copied ? "Copied" : "Copy new code"}
                        </Button>
                        <Button
                          onClick={() => sendFeedback(5)}
                          variant="ghost"
                          size="sm"
                          disabled={!!feedback}
                          className={`${
                            feedback === "up"
                              ? "text-[#16A34A]"
                              : "text-[#64748B] hover:text-[#16A34A]"
                          }`}
                        >
                          <ThumbsUp className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => sendFeedback(1)}
                          variant="ghost"
                          size="sm"
                          disabled={!!feedback}
                          className={`${
                            feedback === "down"
                              ? "text-[#DC2626]"
                              : "text-[#64748B] hover:text-[#DC2626]"
                          }`}
                        >
                          <ThumbsDown className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    {result.rationale && (
                      <div className="text-xs text-[#475569]">
                        <span className="font-semibold">Rationale: </span>
                        {result.rationale}
                      </div>
                    )}
                    {result.risks && result.risks.toLowerCase() !== "none" && (
                      <div className="text-xs text-[#B45309]">
                        <span className="font-semibold">Risks: </span>
                        {result.risks}
                      </div>
                    )}
                    <DiffView diff={result.diff || ""} />
                  </>
                )}
              </div>
            )}
          </div>

          {/* RIGHT: instruction box */}
          <div className="w-80 border-l-2 border-[#E2E8F0] bg-white p-4 flex flex-col gap-3 overflow-y-auto">
            <div>
              <div className="text-[10px] uppercase tracking-wide text-[#64748B] mb-1">
                Granularity
              </div>
              <div className="flex gap-2">
                {(["function", "file"] as Granularity[]).map((g) => (
                  <button
                    key={g}
                    onClick={() => setGranularity(g)}
                    className={`flex-1 text-xs px-3 py-1.5 rounded-sm border-2 ${
                      granularity === g
                        ? "border-[#1E3A8A] bg-[#1E3A8A] text-white"
                        : "border-[#CBD5E1] text-[#64748B] hover:border-[#1E3A8A]"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-wide text-[#64748B] mb-1">
                Target
              </div>
              <div className="text-xs font-mono break-all border-2 border-[#E2E8F0] rounded-sm px-2 py-1.5 bg-[#F8FAFC] min-h-[2.5rem]">
                {selectedPath || (
                  <span className="text-[#94A3B8]">no file selected</span>
                )}
                {granularity === "function" && selectedSymbol && (
                  <div className="text-[#1E3A8A] font-semibold mt-0.5">
                    fn {selectedSymbol}
                  </div>
                )}
              </div>
              {granularity === "function" && !selectedSymbol && selectedPath && (
                <div className="text-[10px] text-[#B45309] mt-1">
                  Pick a function from the tree, or switch to “file” to refactor
                  the whole file.
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col">
              <div className="text-[10px] uppercase tracking-wide text-[#64748B] mb-1">
                Instruction
              </div>
              <textarea
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder={
                  granularity === "function"
                    ? "e.g. extract validation into a helper, add type hints, simplify the early-return chain"
                    : "e.g. convert callbacks to async/await, split into smaller functions"
                }
                className="flex-1 min-h-[140px] border-2 border-[#CBD5E1] rounded-sm p-2 text-sm focus:border-[#1E3A8A] outline-none resize-none"
              />
            </div>

            <Button
              onClick={runRefactor}
              disabled={!canRun}
              className="w-full bg-[#1E3A8A] text-white hover:bg-[#1E40AF] disabled:bg-[#94A3B8]"
            >
              {running ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Refactoring…
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" /> Refactor
                </>
              )}
            </Button>

            <div className="text-[10px] text-[#94A3B8] mt-1">
              Read-only: returns a diff. Nothing is written to disk or pushed to GitHub.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
