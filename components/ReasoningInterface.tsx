import { useState, useRef, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import {
    Send,
    Sparkles,
    FileCode,
    GitCommit,
    FileText,
    AlertCircle,
    TrendingUp,
    Clock,
    CheckCircle2,
    Copy,
    Share2,
    History,
    Plus,
    MessageSquare,
    ChevronDown,
    ChevronRight,
    Database,
    Brain
} from "lucide-react";

interface ReasoningInterfaceProps {
    navigateTo: (page: string) => void;
}

interface Evidence {
    type: "commit" | "doc" | "log" | "code";
    title: string;
    content: string;
    confidence: number;
    timestamp?: string;
    source?: string;
}

interface Message {
    id: string;
    role: "user" | "ai";
    content: string;
    timestamp: Date;
    evidence?: Evidence[];
}

export function ReasoningInterface({ navigateTo }: ReasoningInterfaceProps) {
    const [query, setQuery] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [expandedEvidence, setExpandedEvidence] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isProcessing]);

    // Sample data
    const sampleEvidence: Evidence[] = [
        {
            type: "commit",
            title: "feat: migrate to OAuth 2.0 authentication",
            content: "Replaced JWT-based auth with OAuth 2.0 flow. Implements refresh token rotation and improved security measures as recommended by security audit.",
            confidence: 95,
            timestamp: "2024-03-15",
            source: "main branch • commit a3f2b1c"
        },
        {
            type: "doc",
            title: "Security Audit Report - Authentication",
            content: "JWT implementation shows vulnerabilities in token expiration handling. Recommend migration to OAuth 2.0 with proper refresh token rotation.",
            confidence: 92,
            timestamp: "2024-02-28",
            source: "docs/security/audit-2024-q1.md"
        },
        {
            type: "code",
            title: "auth.service.ts",
            content: "export class AuthService {\n  async validateToken(token: string) {\n    // Deprecated: JWT validation\n    // Use OAuth2Service instead\n  }\n}",
            confidence: 88,
            timestamp: "2024-03-20",
            source: "src/services/auth.service.ts"
        }
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        // Add user message
        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: query,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMsg]);
        setQuery("");
        setIsProcessing(true);

        // Simulate AI response
        setTimeout(() => {
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "ai",
                content: "Based on the commit history and security documentation, JWT authentication was deprecated in version 3.0. \n\nThe primary driver was a security audit that identified vulnerabilities in token expiration handling. The team decided to migrate to OAuth 2.0 with refresh token rotation to address these concerns and align with industry best practices.",
                timestamp: new Date(),
                evidence: sampleEvidence
            };
            setMessages(prev => [...prev, aiMsg]);
            setIsProcessing(false);
        }, 2000);
    };

    const getEvidenceIcon = (type: Evidence["type"]) => {
        switch (type) {
            case "commit": return GitCommit;
            case "doc": return FileText;
            case "log": return AlertCircle;
            case "code": return FileCode;
        }
    };

    const getEvidenceStyles = (type: Evidence["type"]) => {
        switch (type) {
            case "commit": return { bg: "bg-blue-50", text: "text-blue-600", iconBg: "bg-blue-50", iconText: "text-blue-600" };
            case "doc": return { bg: "bg-purple-50", text: "text-purple-600", iconBg: "bg-purple-50", iconText: "text-purple-600" };
            case "log": return { bg: "bg-orange-50", text: "text-orange-600", iconBg: "bg-orange-50", iconText: "text-orange-600" };
            case "code": return { bg: "bg-green-50", text: "text-green-600", iconBg: "bg-green-50", iconText: "text-green-600" };
            default: return { bg: "bg-gray-50", text: "text-gray-600", iconBg: "bg-gray-50", iconText: "text-gray-600" };
        }
    };

    return (
        <div className="flex h-screen bg-white">
            <Sidebar currentPage="reasoning" navigateTo={navigateTo} />

            {/* Sub-sidebar for History */}
            <div className="w-64 border-r border-gray-200 bg-gray-50 flex flex-col hidden lg:flex">
                <div className="p-4 border-b border-gray-200">
                    <button
                        onClick={() => setMessages([])}
                        className="w-full flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 hover:border-purple-300 hover:shadow-sm transition-all text-sm font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        New Reasoning Session
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-3">
                    <div className="text-xs font-semibold text-gray-500 mb-3 px-2">RECENT QUESTIONS</div>
                    <div className="space-y-1">
                        {[
                            "JWT vs OAuth migration",
                            "Understanding auth flow",
                            "Database schema changes",
                            "API rate limiting logic"
                        ].map((item, i) => (
                            <button key={i} className="w-full text-left p-2.5 rounded-lg hover:bg-white hover:shadow-sm transition-all text-sm text-gray-700 truncate group flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-gray-400 group-hover:text-purple-500" />
                                <span className="truncate">{item}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl border border-purple-100">
                        <div className="p-1.5 bg-purple-100 rounded-lg">
                            <Sparkles className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-purple-900">Pro Reasoning</p>
                            <p className="text-[10px] text-purple-700">6,432 items indexed</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col relative">
                {/* Header */}
                <div className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6">
                    <div className="flex items-center gap-2">
                        <h1 className="text-lg font-semibold">Reasoning Engine</h1>
                        <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full border border-green-100 flex items-center gap-1">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                            Online
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-500 hover:text-gray-700">
                            <Share2 className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-500 hover:text-gray-700">
                            <History className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-white">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center -mt-10">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
                                <Brain className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-2">How can I help you understand code?</h2>
                            <p className="text-gray-500 mb-8 max-w-md text-center">
                                I can analyze your commits, documentation, and logic to explain the "why" behind your codebase.
                            </p>

                            <div className="grid grid-cols-2 gap-4 max-w-2xl w-full">
                                {[
                                    { icon: GitCommit, label: "Explain latest changes to auth", color: "blue" },
                                    { icon: AlertCircle, label: "Debug recurring 500 errors", color: "red" },
                                    { icon: FileCode, label: "Document the payment module", color: "green" },
                                    { icon: Database, label: "Connect new data source", color: "purple" }
                                ].map((item, i) => {
                                    const Icon = item.icon;
                                    return (
                                        <button
                                            key={i}
                                            onClick={() => setQuery(item.label)}
                                            className="p-4 bg-white border border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-md transition-all text-left flex items-start gap-4 group"
                                        >
                                            <div className={`p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors`}>
                                                <Icon className={`w-5 h-5 text-purple-600`} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 group-hover:text-purple-700 transition-colors">{item.label}</p>
                                                <p className="text-xs text-gray-500 mt-1">Tap to ask</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div key={msg.id} className={`flex gap-6 ${msg.role === 'ai' ? 'max-w-4xl' : 'max-w-3xl ml-auto'}`}>
                                {msg.role === "ai" && (
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                                        <Sparkles className="w-4 h-4 text-white" />
                                    </div>
                                )}

                                <div className="flex-1 space-y-4">
                                    <div className={`p-6 rounded-2xl ${msg.role === 'user'
                                        ? 'bg-gray-100 text-gray-900'
                                        : 'bg-white border border-gray-100 shadow-sm'
                                        }`}>
                                        <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                    </div>

                                    {/* Evidence Cards for AI response */}
                                    {msg.evidence && (
                                        <div className="space-y-3 pl-2">
                                            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                                <TrendingUp className="w-4 h-4" />
                                                Verified Evidence
                                            </div>
                                            {msg.evidence.map((evidence, idx) => {
                                                const Icon = getEvidenceIcon(evidence.type);
                                                const styles = getEvidenceStyles(evidence.type);
                                                const isExpanded = expandedEvidence === `${msg.id}-${idx}`;

                                                return (
                                                    <div
                                                        key={idx}
                                                        className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-all hover:border-purple-300"
                                                    >
                                                        <button
                                                            onClick={() => setExpandedEvidence(isExpanded ? null : `${msg.id}-${idx}`)}
                                                            className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 transition-colors"
                                                        >
                                                            <div className={`p-2 ${styles.bg} rounded-lg`}>
                                                                <Icon className={`w-4 h-4 ${styles.text}`} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center justify-between">
                                                                    <p className="font-medium text-gray-900 truncate">{evidence.title}</p>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                                                                            {evidence.confidence}% Match
                                                                        </span>
                                                                        {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                                                                    </div>
                                                                </div>
                                                                <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                                                    {evidence.type.toUpperCase()} • {evidence.source}
                                                                </p>
                                                            </div>
                                                        </button>

                                                        {isExpanded && (
                                                            <div className="px-4 pb-4 pt-0">
                                                                <div className="ml-12 p-3 bg-gray-50 rounded-lg text-sm text-gray-600 border border-gray-100 font-mono">
                                                                    {evidence.content}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}

                    {isProcessing && (
                        <div className="flex gap-6 max-w-4xl">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 animate-pulse">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 text-gray-500 text-sm animate-pulse">
                                    <Clock className="w-4 h-4" />
                                    Reasoning across 4 data sources...
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-6 bg-white border-t border-gray-100">
                    <div className="max-w-4xl mx-auto relative">
                        <form onSubmit={handleSubmit}>
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Ask about 'auth', 'database', or 'errors'..."
                                className="w-full pl-6 pr-32 py-4 rounded-2xl border-2 border-gray-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-50 focus:outline-none transition-all shadow-sm text-lg"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                <div className="h-8 w-[1px] bg-gray-200"></div>
                                <button
                                    type="submit"
                                    disabled={!query.trim() || isProcessing}
                                    className="p-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </form>
                        <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Infinium reasons using real commits, logs, and docs
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
