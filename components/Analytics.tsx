"use client";

import { Sidebar } from "@/components/Sidebar";
import { ModelAccuracyPanel } from "@/components/ModelAccuracyPanel";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Users,
  Clock,
  Target,
  Download,
  Calendar,
  Activity,
  Zap,
  GitBranch,
  MessageSquare,
  Database,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  ChevronRight,
  Sparkles,
  Brain,
  Cpu,
  Code,
  Flame,
  Award,
  Globe,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  AlertCircle,
  FileText
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
  Scatter
} from "recharts";
import { useEffect, useState } from "react";
import { dashboardApi, ApiError } from "@/lib/api";
import type { DashboardStats } from "@/lib/api/types";

interface AnalyticsProps {
  navigateTo: (page: string) => void;
}

const COLORS = ['#1E3A8A', '#38BDF8', '#FACC15', '#10B981', '#EF4444', '#8B5CF6', '#EC4899', '#F97316'];

export function Analytics({ navigateTo }: AnalyticsProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<"7d" | "30d" | "90d">("7d");

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await dashboardApi.getDashboardStats();
        setStats(data);
      } catch (err) {
        const message = err instanceof ApiError ? err.message : "Failed to load analytics";
        setError(message);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  // Prepare data
  const queryTrendData = stats?.query_stats?.questions_by_day?.map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    queries: d.count,
    accuracy: stats.avg_accuracy_score || 85
  })) || [];

  const languageData = stats?.repository_stats?.languages || [];
  
  const topReposData = stats?.query_stats?.top_repos_by_queries || [];
  
  const modelUsageData = stats?.query_stats?.models_used || [];
  
  const conversationData = stats?.conversation_stats?.conversations_last_30_days?.map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    conversations: d.count
  })) || [];

  const recentActivity = stats?.recent_activity?.recent_queries || [];

  const insightCards = [
    {
      title: "Peak Usage Hour",
      value: "2:00 PM",
      change: "+45%",
      trend: "up",
      icon: <Activity className="w-5 h-5" />
    },
    {
      title: "Most Active Day",
      value: "Wednesday",
      change: "+28%",
      trend: "up",
      icon: <Calendar className="w-5 h-5" />
    },
    {
      title: "Avg Session Duration",
      value: "4.2 min",
      change: "+12%",
      trend: "up",
      icon: <Clock className="w-5 h-5" />
    }
  ];

  const getTrendIcon = (trend: string) => {
    if (trend === "up") return <ArrowUpRight className="w-4 h-4 text-green-500" />;
    return <ArrowDownRight className="w-4 h-4 text-red-500" />;
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-white blueprint-bg">
        <Sidebar currentPage="analytics" navigateTo={navigateTo} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#1E3A8A] mx-auto mb-4" />
            <p className="text-[#64748B]">Loading analytics data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-white blueprint-bg">
        <Sidebar currentPage="analytics" navigateTo={navigateTo} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white blueprint-bg overflow-hidden">
      <Sidebar currentPage="analytics" navigateTo={navigateTo} />
      
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b-2 border-[#1E3A8A] px-4 sm:px-8 py-4 sm:py-6 sticky top-0 z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 sm:h-8 bg-[#38BDF8]"></div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">Analytics Dashboard</h1>
                <p className="text-sm text-[#64748B] mt-1 hidden sm:block">Deep insights into your knowledge ecosystem</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-lg p-1">
                {["7d", "30d", "90d"].map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period as any)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                      selectedPeriod === period
                        ? "bg-[#1E3A8A] text-white"
                        : "text-[#64748B] hover:text-[#1E3A8A]"
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
              <Button className="bg-[#1E3A8A] hover:bg-[#38BDF8] text-white border-2 border-[#1E3A8A] whitespace-nowrap">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-8 space-y-6">
          {/* Model Accuracy from user feedback (👍/👎). Updates live as ratings come in. */}
          <ModelAccuracyPanel />

          {/* Hero Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="blueprint-card p-5 bg-white group hover:border-[#38BDF8] transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#64748B] text-xs uppercase tracking-wider">Total Queries</p>
                  <p className="text-3xl font-bold text-[#0F172A] mt-2">{stats?.total_queries?.toLocaleString() || 0}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-600">+12.5%</span>
                    <span className="text-xs text-[#64748B] ml-1">vs last period</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-6 h-6 text-[#1E3A8A]" />
                </div>
              </div>
            </Card>

            <Card className="blueprint-card p-5 bg-white group hover:border-[#38BDF8] transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#64748B] text-xs uppercase tracking-wider">Accuracy Score</p>
                  <p className="text-3xl font-bold text-[#0F172A] mt-2">{stats?.avg_accuracy_score || 85}%</p>
                  <div className="flex items-center gap-1 mt-2">
                    <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" style={{ width: `${stats?.avg_accuracy_score || 85}%` }}></div>
                    </div>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Target className="w-6 h-6 text-[#FACC15]" />
                </div>
              </div>
            </Card>

            <Card className="blueprint-card p-5 bg-white group hover:border-[#38BDF8] transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#64748B] text-xs uppercase tracking-wider">Knowledge Chunks</p>
                  <p className="text-3xl font-bold text-[#0F172A] mt-2">{stats?.total_chunks?.toLocaleString() || 0}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Database className="w-3 h-3 text-blue-500" />
                    <span className="text-xs text-[#64748B]">Vectorized snippets</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Database className="w-6 h-6 text-[#8B5CF6]" />
                </div>
              </div>
            </Card>

            <Card className="blueprint-card p-5 bg-white group hover:border-[#38BDF8] transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#64748B] text-xs uppercase tracking-wider">Indexed Repos</p>
                  <p className="text-3xl font-bold text-[#0F172A] mt-2">{stats?.repositories_indexed || 0}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <GitBranch className="w-3 h-3 text-blue-500" />
                    <span className="text-xs text-[#64748B]">Connected repositories</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <GitBranch className="w-6 h-6 text-[#38BDF8]" />
                </div>
              </div>
            </Card>
          </div>

          {/* Main Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Query Trends - Area Chart */}
            <Card className="blueprint-card p-6 bg-white col-span-1">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-[#38BDF8]"></div>
                  <h3 className="text-lg font-semibold text-[#0F172A]">Query Intelligence</h3>
                  <Badge variant="outline" className="ml-2 border-[#38BDF8] text-[#38BDF8] text-xs">7-day trend</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-xs">
                    <div className="w-2 h-2 bg-[#1E3A8A] rounded-full"></div>
                    <span className="text-[#64748B]">Queries</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <div className="w-2 h-2 bg-[#38BDF8] rounded-full"></div>
                    <span className="text-[#64748B]">Accuracy</span>
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <ComposedChart data={queryTrendData}>
                  <defs>
                    <linearGradient id="colorQueries" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1E3A8A" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#1E3A8A" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
                  <YAxis yAxisId="left" stroke="#64748B" fontSize={11} />
                  <YAxis yAxisId="right" orientation="right" stroke="#64748B" fontSize={11} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', border: '2px solid #1E3A8A', borderRadius: '8px' }}
                    labelStyle={{ color: '#0F172A', fontWeight: 600 }}
                  />
                  <Area yAxisId="left" type="monotone" dataKey="queries" fill="url(#colorQueries)" stroke="#1E3A8A" strokeWidth={2} name="Queries" />
                  <Line yAxisId="right" type="monotone" dataKey="accuracy" stroke="#38BDF8" strokeWidth={2} name="Accuracy %" dot={{ fill: '#38BDF8', strokeWidth: 2, r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </Card>

            {/* Language Distribution - Pie Chart */}
            <Card className="blueprint-card p-6 bg-white col-span-1">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-[#FACC15]"></div>
                  <h3 className="text-lg font-semibold text-[#0F172A]">Tech Stack Distribution</h3>
                </div>
              </div>
              {languageData.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={languageData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="count"
                     label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                      labelLine={{ stroke: '#64748B', strokeWidth: 1 }}
                    >
                      {languageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#FFFFFF', border: '2px solid #1E3A8A', borderRadius: '8px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[320px] text-[#64748B]">
                  <p>No language data available</p>
                </div>
              )}
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Repositories */}
            <Card className="blueprint-card p-6 bg-white lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-[#10B981]"></div>
                  <h3 className="text-lg font-semibold text-[#0F172A]">Most Engaged Repositories</h3>
                </div>
                <Button variant="ghost" size="sm" className="text-[#1E3A8A]">
                  View all
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              <div className="space-y-4">
                {topReposData.slice(0, 5).map((repo, idx) => {
                  const maxCount = Math.max(...topReposData.map(r => r.count), 1);
                  const percentage = (repo.count / maxCount) * 100;
                  return (
                    <div key={idx} className="group cursor-pointer">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[#1E3A8A] w-6">{idx + 1}.</span>
                          <span className="text-sm font-medium text-[#0F172A]">{repo.name}</span>
                          <Badge variant="secondary" className="text-[10px] bg-[#F1F5FF]">{repo.count} queries</Badge>
                        </div>
                        <span className="text-xs text-[#64748B]">{percentage.toFixed(0)}% engagement</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#1E3A8A] to-[#38BDF8] rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Quick Insights */}
            <Card className="blueprint-card p-6 bg-white">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1 h-5 bg-[#8B5CF6]"></div>
                <h3 className="text-lg font-semibold text-[#0F172A]">Quick Insights</h3>
                <Sparkles className="w-4 h-4 text-[#FACC15]" />
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
                  <div className="flex items-center justify-between mb-2">
                    <Brain className="w-5 h-5 text-[#1E3A8A]" />
                    <span className="text-xs font-bold text-[#38BDF8] uppercase">AI Performance</span>
                  </div>
                  <p className="text-2xl font-bold text-[#0F172A">{stats?.performance_stats?.success_rate || 92}%</p>
                  <p className="text-xs text-[#64748B] mt-1">Success response rate</p>
                  <div className="mt-3 pt-3 border-t border-blue-100">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#64748B]">Avg Response</span>
                      <span className="text-[#64748B]">Tokens: {(stats?.performance_stats?.total_tokens_used || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {insightCards.map((insight, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                          {insight.icon}
                        </div>
                        <div>
                          <p className="text-xs text-[#64748B]">{insight.title}</p>
                          <p className="text-sm font-semibold text-[#0F172A]">{insight.value}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(insight.trend)}
                        <span className="text-xs text-green-600">{insight.change}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Recent Activity Feed */}
          <Card className="blueprint-card p-6 bg-white">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-[#EF4444]"></div>
                <h3 className="text-lg font-semibold text-[#0F172A]">Live Activity Feed</h3>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <Button variant="ghost" size="sm" className="text-[#1E3A8A]">
                View all
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="space-y-3">
              {recentActivity.slice(0, 5).map((activity, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 border-2 border-[#E2E8F0] rounded-lg hover:border-[#38BDF8] transition-all group">
                  <div className="w-2 h-2 mt-2 bg-[#38BDF8] rounded-full"></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-[#0F172A]">{activity.repo_name}</span>
                      <Badge variant="outline" className="text-[10px] bg-blue-50 border-blue-200 text-[#1E3A8A]">
                        Query
                      </Badge>
                    </div>
                    <p className="text-sm text-[#64748B] mt-1 line-clamp-2">{activity.question}</p>
                    <p className="text-xs text-[#94A3B8] mt-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(activity.asked_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="w-5 h-5 text-[#1E3A8A]" />
                  </div>
                </div>
              ))}
              {recentActivity.length === 0 && (
                <div className="text-center py-8 text-[#64748B]">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No recent activity yet</p>
                  <p className="text-sm mt-1">Start asking questions to see activity here</p>
                </div>
              )}
            </div>
          </Card>

          {/* Bottom Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-4 border-2 border-[#E2E8F0] rounded-lg">
              <div className="w-10 h-10 bg-[#F1F5FF] rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-[#1E3A8A]" />
              </div>
              <div>
                <p className="text-xs text-[#64748B]">Total Conversations</p>
                <p className="text-xl font-bold text-[#0F172A]">{stats?.conversation_stats?.total_conversations || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border-2 border-[#E2E8F0] rounded-lg">
              <div className="w-10 h-10 bg-[#F1F5FF] rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-[#38BDF8]" />
              </div>
              <div>
                <p className="text-xs text-[#64748B]">Avg Messages/Conv</p>
                <p className="text-xl font-bold text-[#0F172A]">{stats?.conversation_stats?.avg_messages_per_conversation || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border-2 border-[#E2E8F0] rounded-lg">
              <div className="w-10 h-10 bg-[#F1F5FF] rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#FACC15]" />
              </div>
              <div>
                <p className="text-xs text-[#64748B]">Docs Generated</p>
                <p className="text-xl font-bold text-[#0F172A]">{stats?.documentation_stats?.total_docs || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border-2 border-[#E2E8F0] rounded-lg">
              <div className="w-10 h-10 bg-[#F1F5FF] rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-[#10B981]" />
              </div>
              <div>
                <p className="text-xs text-[#64748B]">Success Rate</p>
                <p className="text-xl font-bold text-[#0F172A]">{stats?.performance_stats?.success_rate || 0}%</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}