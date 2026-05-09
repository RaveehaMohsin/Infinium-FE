import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import {
    AlertTriangle,
    TrendingDown,
    TrendingUp,
    Activity,
    Filter,
    Calendar,
    Code,
    Server,
    Database,
    Lightbulb,
    ExternalLink,
    ChevronDown,
    ChevronUp
} from "lucide-react";

interface ErrorInsightsProps {
    navigateTo: (page: string) => void;
}

interface ErrorPattern {
    id: string;
    endpoint: string;
    errorType: string;
    count: number;
    trend: "up" | "down" | "stable";
    lastOccurred: string;
    affectedUsers: number;
    category: "api" | "database" | "frontend";
    suggestedFix?: string;
    relatedIssues: string[];
}

export function ErrorInsights({ navigateTo }: ErrorInsightsProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [timeRange, setTimeRange] = useState("7d");
    const [expandedError, setExpandedError] = useState<string | null>(null);

    const errorPatterns: ErrorPattern[] = [
        {
            id: "err-001",
            endpoint: "/api/v1/users/profile",
            errorType: "500 Internal Server Error",
            count: 342,
            trend: "up",
            lastOccurred: "2 hours ago",
            affectedUsers: 89,
            category: "api",
            suggestedFix: "Database connection pool exhaustion detected. Consider increasing max_connections from 100 to 200 in PostgreSQL config.",
            relatedIssues: ["ISSUE-1234", "ISSUE-1189"]
        },
        {
            id: "err-002",
            endpoint: "/api/v1/payments/process",
            errorType: "504 Gateway Timeout",
            count: 156,
            trend: "up",
            lastOccurred: "45 minutes ago",
            affectedUsers: 42,
            category: "api",
            suggestedFix: "Payment gateway response time exceeds 30s threshold. Implement async processing with webhook callbacks.",
            relatedIssues: ["ISSUE-1256"]
        },
        {
            id: "err-003",
            endpoint: "DatabaseQuery: user_analytics",
            errorType: "Query Timeout",
            count: 98,
            trend: "stable",
            lastOccurred: "3 hours ago",
            affectedUsers: 23,
            category: "database",
            suggestedFix: "Missing index on user_events.created_at column. Add composite index (user_id, created_at) for better performance.",
            relatedIssues: ["ISSUE-1201"]
        },
        {
            id: "err-004",
            endpoint: "/dashboard",
            errorType: "TypeError: Cannot read property 'map'",
            count: 67,
            trend: "down",
            lastOccurred: "5 hours ago",
            affectedUsers: 15,
            category: "frontend",
            suggestedFix: "Add null check before mapping analytics data. Implement loading state to prevent race condition.",
            relatedIssues: ["ISSUE-1278"]
        },
        {
            id: "err-005",
            endpoint: "/api/v1/search",
            errorType: "429 Too Many Requests",
            count: 234,
            trend: "up",
            lastOccurred: "1 hour ago",
            affectedUsers: 67,
            category: "api",
            suggestedFix: "Rate limit threshold too aggressive for search endpoint. Increase from 10 req/min to 30 req/min or implement token bucket algorithm.",
            relatedIssues: []
        }
    ];

    const stats = {
        totalErrors: errorPatterns.reduce((sum, err) => sum + err.count, 0),
        criticalEndpoints: errorPatterns.filter(e => e.count > 100).length,
        affectedUsers: errorPatterns.reduce((sum, err) => sum + err.affectedUsers, 0),
        resolvedToday: 12
    };

    const filteredErrors = errorPatterns.filter(error => {
        if (selectedCategory === "all") return true;
        return error.category === selectedCategory;
    });

    const getTrendIcon = (trend: ErrorPattern["trend"]) => {
        switch (trend) {
            case "up": return <TrendingUp className="w-4 h-4 text-red-600" />;
            case "down": return <TrendingDown className="w-4 h-4 text-green-600" />;
            case "stable": return <Activity className="w-4 h-4 text-yellow-600" />;
        }
    };

    const getCategoryIcon = (category: ErrorPattern["category"]) => {
        switch (category) {
            case "api": return <Server className="w-5 h-5" />;
            case "database": return <Database className="w-5 h-5" />;
            case "frontend": return <Code className="w-5 h-5" />;
        }
    };

    const getCategoryStyles = (category: ErrorPattern["category"]) => {
        switch (category) {
            case "api": return "bg-blue-50 text-blue-700 border-blue-100";
            case "database": return "bg-purple-50 text-purple-700 border-purple-100";
            case "frontend": return "bg-orange-50 text-orange-700 border-orange-100";
            default: return "bg-gray-50 text-gray-700 border-gray-100";
        }
    };

    return (
        <div className="flex h-screen bg-white">
            <Sidebar currentPage="analytics" navigateTo={navigateTo} />

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="border-b border-gray-200 bg-white px-8 py-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-2xl font-['Space_Grotesk']">Error Insights</h1>
                    </div>
                    <p className="text-gray-600 font-['Inter']">
                        Analyze recurring errors and get AI-powered fix suggestions
                    </p>
                </div>

                {/* Stats Bar */}
                <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-red-50 px-8 py-6">
                    <div className="grid grid-cols-4 gap-6">
                        <div className="bg-white rounded-xl p-4 border border-gray-200">
                            <div className="text-sm text-gray-600 font-['Inter'] mb-1">Total Errors (7d)</div>
                            <div className="text-3xl font-['Space_Grotesk'] text-gray-900">{stats.totalErrors}</div>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-200">
                            <div className="text-sm text-gray-600 font-['Inter'] mb-1">Critical Endpoints</div>
                            <div className="text-3xl font-['Space_Grotesk'] text-red-600">{stats.criticalEndpoints}</div>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-200">
                            <div className="text-sm text-gray-600 font-['Inter'] mb-1">Affected Users</div>
                            <div className="text-3xl font-['Space_Grotesk'] text-orange-600">{stats.affectedUsers}</div>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-200">
                            <div className="text-sm text-gray-600 font-['Inter'] mb-1">Resolved Today</div>
                            <div className="text-3xl font-['Space_Grotesk'] text-green-600">{stats.resolvedToday}</div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="border-b border-gray-200 bg-gray-50 px-8 py-4">
                    <div className="flex gap-4 items-center">
                        <Filter className="w-5 h-5 text-gray-600" />

                        {/* Category Filter */}
                        <div className="flex gap-2">
                            {["all", "api", "database", "frontend"].map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-2 rounded-lg font-['Inter'] text-sm transition-all ${selectedCategory === cat
                                            ? "bg-red-600 text-white"
                                            : "bg-white border border-gray-200 text-gray-700 hover:border-red-300"
                                        }`}
                                >
                                    {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </button>
                            ))}
                        </div>

                        {/* Time Range */}
                        <div className="ml-auto flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-gray-600" />
                            <select
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value)}
                                className="px-4 py-2 rounded-lg border border-gray-200 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100 font-['Inter']"
                            >
                                <option value="24h">Last 24 hours</option>
                                <option value="7d">Last 7 days</option>
                                <option value="30d">Last 30 days</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Error List */}
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-6xl mx-auto space-y-4">
                        {filteredErrors.map((error) => {
                            const isExpanded = expandedError === error.id;
                            const CategoryIcon = getCategoryIcon(error.category);

                            return (
                                <div
                                    key={error.id}
                                    className="bg-white rounded-xl border-2 border-gray-200 hover:border-red-300 transition-all overflow-hidden"
                                >
                                    {/* Main Info */}
                                    <div
                                        className="p-6 cursor-pointer"
                                        onClick={() => setExpandedError(isExpanded ? null : error.id)}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`p-3 ${getCategoryStyles(error.category)} rounded-lg`}>
                                                {CategoryIcon}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-4 mb-2">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <span className="text-sm font-mono text-gray-500 font-['Inter']">
                                                                {error.id}
                                                            </span>
                                                            <span className={`px-2 py-1 ${getCategoryStyles(error.category)} text-xs rounded-full font-['Inter'] border`}>
                                                                {error.category}
                                                            </span>
                                                            {getTrendIcon(error.trend)}
                                                        </div>
                                                        <h3 className="text-lg font-['Space_Grotesk'] text-gray-900 mb-1">
                                                            {error.endpoint}
                                                        </h3>
                                                        <p className="text-red-600 font-['Inter'] text-sm mb-3">
                                                            {error.errorType}
                                                        </p>
                                                    </div>
                                                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                                        {isExpanded ? (
                                                            <ChevronUp className="w-5 h-5 text-gray-600" />
                                                        ) : (
                                                            <ChevronDown className="w-5 h-5 text-gray-600" />
                                                        )}
                                                    </button>
                                                </div>

                                                <div className="flex items-center gap-6 text-sm text-gray-600 font-['Inter']">
                                                    <div>
                                                        <span className="font-medium text-gray-900">{error.count}</span> occurrences
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-gray-900">{error.affectedUsers}</span> users affected
                                                    </div>
                                                    <div>
                                                        Last: <span className="font-medium text-gray-900">{error.lastOccurred}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    {isExpanded && (
                                        <div className="border-t border-gray-200 bg-gray-50 p-6 space-y-4">
                                            {/* Suggested Fix */}
                                            {error.suggestedFix && (
                                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                                    <div className="flex gap-3">
                                                        <Lightbulb className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                                        <div>
                                                            <h4 className="text-sm font-['Space_Grotesk'] text-green-900 mb-2">
                                                                AI-Suggested Fix
                                                            </h4>
                                                            <p className="text-sm text-green-800 font-['Inter'] leading-relaxed">
                                                                {error.suggestedFix}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Related Issues */}
                                            {error.relatedIssues.length > 0 && (
                                                <div>
                                                    <h4 className="text-sm font-['Space_Grotesk'] text-gray-700 mb-2">
                                                        Related Issues
                                                    </h4>
                                                    <div className="flex gap-2">
                                                        {error.relatedIssues.map((issue, i) => (
                                                            <button
                                                                key={i}
                                                                className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-blue-300 hover:bg-blue-50 transition-colors font-['Inter']"
                                                            >
                                                                {issue}
                                                                <ExternalLink className="w-3 h-3" />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Actions */}
                                            <div className="flex gap-3 pt-2">
                                                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-['Inter'] text-sm">
                                                    View Full Trace
                                                </button>
                                                <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-['Inter'] text-sm">
                                                    Create Issue
                                                </button>
                                                <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-['Inter'] text-sm">
                                                    Mark as Resolved
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
