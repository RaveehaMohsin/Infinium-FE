import { useState } from "react";

import { Sidebar } from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search,
  FileText,
  GitCommit,
  AlertCircle,
  Activity,
  Filter,
  Calendar,
  Tag,
  ExternalLink,
  BookOpen
} from "lucide-react";

interface KnowledgeBaseProps {
  navigateTo: (page: string) => void;
}

export function KnowledgeBase({ navigateTo }: KnowledgeBaseProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const knowledgeItems = [
    {
      id: 1,
      type: "Architecture Decision",
      title: "Migration from JWT to OAuth2",
      description: "Complete authentication strategy overhaul for improved security and scalability",
      date: "2024-12-15",
      tags: ["Security", "Authentication", "Backend"],
      sources: ["PR #342", "ADR-023"],
      confidence: 94
    },
    {
      id: 2,
      type: "Code Pattern",
      title: "Redis Caching Strategy",
      description: "Standardized approach for caching user sessions and API responses",
      date: "2024-12-10",
      tags: ["Performance", "Caching", "Redis"],
      sources: ["8 Repositories", "Tech Doc"],
      confidence: 91
    },
    {
      id: 3,
      type: "Error Pattern",
      title: "Database Connection Timeout Issues",
      description: "Recurring 500 errors on /api/v2/users/profile endpoint",
      date: "2024-12-18",
      tags: ["Error", "Database", "Critical"],
      sources: ["Sentry", "CI/CD Logs"],
      confidence: 88
    },
    {
      id: 4,
      type: "Documentation",
      title: "Microservices Architecture Evolution",
      description: "Historical context of service decomposition from monolith",
      date: "2024-11-28",
      tags: ["Architecture", "Microservices"],
      sources: ["Confluence", "3 PRs"],
      confidence: 96
    },
    {
      id: 5,
      type: "Best Practice",
      title: "API Versioning Guidelines",
      description: "Team standards for API versioning and deprecation strategies",
      date: "2024-12-05",
      tags: ["API", "Standards", "Backend"],
      sources: ["Team Wiki", "5 PRs"],
      confidence: 92
    },
    {
      id: 6,
      type: "Performance Insight",
      title: "Query Optimization Patterns",
      description: "Common database query optimization techniques used across services",
      date: "2024-12-12",
      tags: ["Performance", "Database", "Optimization"],
      sources: ["12 Commits", "Datadog"],
      confidence: 89
    }
  ];

  const recentUpdates = [
    { title: "New architecture decision documented", time: "2 hours ago", type: "architecture" },
    { title: "3 new error patterns detected", time: "5 hours ago", type: "error" },
    { title: "Caching strategy updated", time: "1 day ago", type: "pattern" },
    { title: "Documentation synced from Confluence", time: "2 days ago", type: "docs" },
  ];

  const popularTags = [
    { name: "Architecture", count: 45 },
    { name: "Security", count: 38 },
    { name: "Performance", count: 52 },
    { name: "Database", count: 41 },
    { name: "API", count: 36 },
    { name: "Authentication", count: 29 },
  ];

  return (
    <div className="flex h-screen bg-white blueprint-bg">
      <Sidebar currentPage="knowledge" navigateTo={navigateTo} />
      
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b-2 border-[#1E3A8A] px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-[#38BDF8]"></div>
            <div>
              <h1 className="text-3xl font-bold text-[#0F172A]">Knowledge Base</h1>
              <p className="text-[#64748B] mt-1">Explore your organization's institutional memory</p>
            </div>
          </div>
        </header>

        <div className="p-8 space-y-6">
          {/* Search and Filters */}
          <Card className="blueprint-card p-6 bg-white">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#CBD5E1]" strokeWidth={1.5} />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search knowledge base..."
                  className="pl-10 border-2 border-[#CBD5E1] text-[#0F172A] focus:border-[#38BDF8]"
                />
              </div>
              <Button variant="outline" className="border-2 border-[#CBD5E1] text-[#0F172A] hover:border-[#1E3A8A]">
                <Filter className="w-4 h-4 mr-2" strokeWidth={1.5} />
                Filters
              </Button>
              <Button variant="outline" className="border-2 border-[#CBD5E1] text-[#0F172A] hover:border-[#1E3A8A]">
                <Calendar className="w-4 h-4 mr-2" strokeWidth={1.5} />
                Date Range
              </Button>
            </div>
          </Card>

          <div className="grid grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="col-span-2 space-y-6">
              <Tabs defaultValue="all" className="space-y-6">
                <TabsList className="bg-white border-2 border-[#E2E8F0]">
                  <TabsTrigger value="all">All Knowledge</TabsTrigger>
                  <TabsTrigger value="architecture">Architecture</TabsTrigger>
                  <TabsTrigger value="patterns">Code Patterns</TabsTrigger>
                  <TabsTrigger value="errors">Error Insights</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                  {knowledgeItems.map((item) => (
                    <Card key={item.id} className="blueprint-card p-6 bg-white hover:border-[#38BDF8] transition-colors cursor-pointer">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge variant="outline" className="border-2 border-[#1E3A8A] text-[#1E3A8A]">
                                {item.type}
                              </Badge>
                              <span className="text-[#64748B] text-sm flex items-center gap-1 blueprint-label">
                                <Calendar className="w-3 h-3" strokeWidth={1.5} />
                                {item.date}
                              </span>
                            </div>
                            <h3 className="text-xl font-semibold text-[#0F172A] mb-2">{item.title}</h3>
                            <p className="text-[#64748B] text-sm">{item.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-[#38BDF8]">{item.confidence}%</div>
                            <p className="text-[#64748B] text-xs blueprint-label">confidence</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          {item.tags.map((tag, idx) => (
                            <Badge key={idx} variant="secondary" className="bg-[#F8FAFC] text-[#64748B] border-2 border-[#E2E8F0]">
                              <Tag className="w-3 h-3 mr-1" strokeWidth={1.5} />
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t-2 border-[#E2E8F0]">
                          <div className="flex items-center gap-4 text-sm text-[#64748B]">
                            {item.sources.map((source, idx) => (
                              <span key={idx} className="flex items-center gap-1">
                                {source.includes("PR") && <GitCommit className="w-4 h-4" strokeWidth={1.5} />}
                                {source.includes("Repositories") && <FileText className="w-4 h-4" strokeWidth={1.5} />}
                                {source.includes("Sentry") && <AlertCircle className="w-4 h-4" strokeWidth={1.5} />}
                                {source.includes("Confluence") && <BookOpen className="w-4 h-4" strokeWidth={1.5} />}
                                {source}
                              </span>
                            ))}
                          </div>
                          <Button size="sm" variant="ghost" className="text-[#1E3A8A] hover:text-[#38BDF8]">
                            View Details
                            <ExternalLink className="w-4 h-4 ml-2" strokeWidth={1.5} />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="architecture">
                  <Card className="blueprint-card p-6 bg-white">
                    <p className="text-[#64748B]">Architecture-specific knowledge items will be displayed here...</p>
                  </Card>
                </TabsContent>

                <TabsContent value="patterns">
                  <Card className="blueprint-card p-6 bg-white">
                    <p className="text-[#64748B]">Code pattern knowledge items will be displayed here...</p>
                  </Card>
                </TabsContent>

                <TabsContent value="errors">
                  <Card className="blueprint-card p-6 bg-white">
                    <p className="text-[#64748B]">Error insight knowledge items will be displayed here...</p>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Stats */}
              <Card className="blueprint-card p-6 bg-white">
                <h3 className="text-lg font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
                  <div className="w-1 h-5 bg-[#1E3A8A]"></div>
                  Knowledge Stats
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-[#64748B]">Total Items</span>
                      <span className="text-[#0F172A] font-semibold">1,247</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-[#64748B]">Last Updated</span>
                      <span className="text-[#0F172A] font-semibold">2 hours ago</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#64748B]">Avg Confidence</span>
                      <span className="text-[#38BDF8] font-semibold">91.2%</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Recent Updates */}
              <Card className="blueprint-card p-6 bg-white">
                <h3 className="text-lg font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
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
                          <p className="text-[#64748B] text-xs mt-1 blueprint-label">{update.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Popular Tags */}
              <Card className="blueprint-card p-6 bg-white">
                <h3 className="text-lg font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
                  <div className="w-1 h-5 bg-[#1E3A8A]"></div>
                  Popular Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag, idx) => (
                    <Badge 
                      key={idx}
                      variant="secondary" 
                      className="bg-[#F8FAFC] text-[#64748B] border-2 border-[#E2E8F0] cursor-pointer hover:border-[#1E3A8A]"
                    >
                      {tag.name} ({tag.count})
                    </Badge>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}