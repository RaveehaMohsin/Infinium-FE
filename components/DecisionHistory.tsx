import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import {
    Clock,
    GitBranch,
    User,
    Filter,
    Search,
    Calendar,
    Tag,
    ExternalLink,
    ChevronRight
} from "lucide-react";

interface DecisionHistoryProps {
    navigateTo: (page: string) => void;
}

interface Decision {
    id: string;
    title: string;
    description: string;
    author: string;
    date: string;
    category: string;
    tags: string[];
    relatedCommits: string[];
    impact: "high" | "medium" | "low";
}

export function DecisionHistory({ navigateTo }: DecisionHistoryProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);

    const decisions: Decision[] = [
        {
            id: "adr-023",
            title: "Migrate to OAuth 2.0 Authentication",
            description: "Decided to deprecate JWT-based authentication in favor of OAuth 2.0 with refresh token rotation. This change addresses security vulnerabilities identified in the Q1 2024 security audit and aligns with industry best practices.",
            author: "Sarah Chen",
            date: "2024-03-01",
            category: "Security",
            tags: ["authentication", "security", "oauth"],
            relatedCommits: ["a3f2b1c", "d7e9f4a"],
            impact: "high"
        },
        {
            id: "adr-022",
            title: "Adopt Redis for Session Caching",
            description: "Implemented Redis as the primary session cache to improve performance and scalability. Previous in-memory caching was causing issues with horizontal scaling.",
            author: "Michael Torres",
            date: "2024-02-15",
            category: "Architecture",
            tags: ["caching", "redis", "performance"],
            relatedCommits: ["b5c3d2e", "f8g9h1i"],
            impact: "high"
        },
        {
            id: "adr-021",
            title: "Standardize API Error Responses",
            description: "Established a consistent error response format across all API endpoints. This improves client-side error handling and debugging experience.",
            author: "Emily Rodriguez",
            date: "2024-01-28",
            category: "API Design",
            tags: ["api", "standards", "error-handling"],
            relatedCommits: ["c6d4e3f"],
            impact: "medium"
        },
        {
            id: "adr-020",
            title: "Migrate from Webpack to Vite",
            description: "Switched build tool from Webpack to Vite for faster development builds and improved developer experience. Build times reduced from 45s to 3s.",
            author: "David Kim",
            date: "2024-01-10",
            category: "Tooling",
            tags: ["build", "vite", "dx"],
            relatedCommits: ["g7h5i4j", "k8l6m5n"],
            impact: "medium"
        },
        {
            id: "adr-019",
            title: "Implement Feature Flag System",
            description: "Introduced feature flags using LaunchDarkly to enable gradual rollouts and A/B testing. This allows safer deployments and better experimentation.",
            author: "Sarah Chen",
            date: "2023-12-20",
            category: "DevOps",
            tags: ["feature-flags", "deployment", "testing"],
            relatedCommits: ["m9n7o6p"],
            impact: "high"
        },
        {
            id: "adr-018",
            title: "Adopt TypeScript Strict Mode",
            description: "Enabled TypeScript strict mode across the codebase to catch more errors at compile time and improve code quality.",
            author: "Michael Torres",
            date: "2023-12-05",
            category: "Code Quality",
            tags: ["typescript", "code-quality"],
            relatedCommits: ["p1q8r7s"],
            impact: "low"
        }
    ];

    const categories = ["all", "Security", "Architecture", "API Design", "Tooling", "DevOps", "Code Quality"];

    const filteredDecisions = decisions.filter(decision => {
        const matchesSearch = decision.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            decision.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            decision.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCategory = selectedCategory === "all" || decision.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const getImpactColor = (impact: Decision["impact"]) => {
        switch (impact) {
            case "high": return "red";
            case "medium": return "yellow";
            case "low": return "green";
        }
    };

    return (
        <div className="flex h-screen bg-white">
            <Sidebar currentPage="decision-history" navigateTo={navigateTo} />

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="border-b border-gray-200 bg-white px-8 py-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                            <Clock className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-2xl font-['Space_Grotesk']">Decision History</h1>
                    </div>
                    <p className="text-gray-600 font-['Inter']">
                        Track architectural decisions and their evolution over time
                    </p>
                </div>

                {/* Filters */}
                <div className="border-b border-gray-200 bg-gray-50 px-8 py-4">
                    <div className="flex gap-4 items-center">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search decisions..."
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 font-['Inter']"
                            />
                        </div>

                        {/* Category Filter */}
                        <div className="flex items-center gap-2">
                            <Filter className="w-5 h-5 text-gray-600" />
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 font-['Inter']"
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>
                                        {cat === "all" ? "All Categories" : cat}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-6xl mx-auto p-8">
                        {/* Timeline */}
                        <div className="relative">
                            {/* Vertical Line */}
                            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500"></div>

                            {/* Decision Nodes */}
                            <div className="space-y-8">
                                {filteredDecisions.map((decision, index) => {
                                    const impactColor = getImpactColor(decision.impact);

                                    return (
                                        <div key={decision.id} className="relative pl-20">
                                            {/* Timeline Dot */}
                                            <div className="absolute left-6 top-6 w-5 h-5 bg-white border-4 border-blue-500 rounded-full shadow-lg"></div>

                                            {/* Decision Card */}
                                            <div
                                                className="bg-white rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all cursor-pointer overflow-hidden"
                                                onClick={() => setSelectedDecision(decision)}
                                            >
                                                <div className="p-6">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <span className="text-sm font-mono text-gray-500 font-['Inter']">
                                                                    {decision.id}
                                                                </span>
                                                                <span className={`px-2 py-1 bg-${impactColor}-100 text-${impactColor}-700 text-xs rounded-full font-['Inter']`}>
                                                                    {decision.impact} impact
                                                                </span>
                                                            </div>
                                                            <h3 className="text-xl font-['Space_Grotesk'] text-gray-900 mb-2">
                                                                {decision.title}
                                                            </h3>
                                                            <p className="text-gray-600 font-['Inter'] leading-relaxed">
                                                                {decision.description}
                                                            </p>
                                                        </div>
                                                        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
                                                    </div>

                                                    {/* Tags */}
                                                    <div className="flex flex-wrap gap-2 mb-4">
                                                        {decision.tags.map((tag, i) => (
                                                            <span
                                                                key={i}
                                                                className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-['Inter']"
                                                            >
                                                                <Tag className="w-3 h-3" />
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>

                                                    {/* Meta Info */}
                                                    <div className="flex items-center gap-6 text-sm text-gray-500 font-['Inter']">
                                                        <div className="flex items-center gap-2">
                                                            <User className="w-4 h-4" />
                                                            <span>{decision.author}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="w-4 h-4" />
                                                            <span>{decision.date}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <GitBranch className="w-4 h-4" />
                                                            <span>{decision.relatedCommits.length} commits</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Tag className="w-4 h-4" />
                                                            <span>{decision.category}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Related Commits */}
                                                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <span className="text-gray-600 font-['Inter']">Related commits:</span>
                                                        {decision.relatedCommits.map((commit, i) => (
                                                            <button
                                                                key={i}
                                                                className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded text-gray-700 hover:border-blue-300 hover:bg-blue-50 transition-colors font-mono text-xs"
                                                            >
                                                                {commit}
                                                                <ExternalLink className="w-3 h-3" />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Empty State */}
                        {filteredDecisions.length === 0 && (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-['Space_Grotesk'] text-gray-900 mb-2">
                                    No decisions found
                                </h3>
                                <p className="text-gray-600 font-['Inter']">
                                    Try adjusting your search or filters
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
