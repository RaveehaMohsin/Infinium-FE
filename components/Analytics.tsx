import { Sidebar } from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  TrendingUp,
  Users,
  Clock,
  Target,
  Download,
  Calendar
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import { dashboardApi, ApiError } from "@/lib/api";
import type { DashboardStats } from "@/lib/api/types";
import { Loader2 } from "lucide-react";

interface AnalyticsProps {
  navigateTo: (page: string) => void;
}

export function Analytics({ navigateTo }: AnalyticsProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const queryTrendData = stats?.query_stats?.questions_by_day?.map(d => ({
    date: d.date,
    queries: d.count,
    accuracy: 85 // placeholder for accuracy trend if not in API yet
  })) || [];

  const topQueries = stats?.recent_activity?.recent_queries?.map(q => ({
    query: q.question,
    count: 1, // backend doesn't provide frequency yet
    accuracy: 90
  })) || [];

  return (
    <div className="flex h-screen bg-white blueprint-bg">
      <Sidebar currentPage="analytics" navigateTo={navigateTo} />
      
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b-2 border-[#1E3A8A] px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-[#38BDF8]"></div>
              <div>
                <h1 className="text-3xl font-bold text-[#0F172A]">Analytics Dashboard</h1>
                <p className="text-[#64748B] mt-1">Track knowledge trends and system performance</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="border-2 border-[#CBD5E1] text-[#0F172A] hover:border-[#1E3A8A]">
                <Calendar className="w-4 h-4 mr-2" strokeWidth={1.5} />
                Last 7 Days
              </Button>
              <Button className="bg-[#1E3A8A] hover:bg-[#38BDF8] text-white border-2 border-[#1E3A8A]">
                <Download className="w-4 h-4 mr-2" strokeWidth={1.5} />
                Export Report
              </Button>
            </div>
          </div>
        </header>

        <div className="p-8 space-y-6">
          {error && (
            <div className="rounded-md border-2 border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* KPI Cards */}
          <div className="grid grid-cols-4 gap-6">
            <Card className="blueprint-card p-6 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-[#64748B] text-sm blueprint-label">Total Queries</p>
                  <p className="text-3xl font-bold text-[#0F172A] mt-2">
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : stats?.total_queries || 0}
                  </p>
                  <p className="text-[#38BDF8] text-sm mt-2 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" strokeWidth={1.5} />
                    <span>User interactions</span>
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-[#1E3A8A]" strokeWidth={1.5} />
              </div>
            </Card>

            <Card className="blueprint-card p-6 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-[#64748B] text-sm blueprint-label">Avg Accuracy</p>
                  <p className="text-3xl font-bold text-[#0F172A] mt-2">
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : `${(stats?.avg_accuracy_score || 0).toFixed(1)}%`}
                  </p>
                  <p className="text-[#FACC15] text-sm mt-2">System confidence</p>
                </div>
                <Target className="w-8 h-8 text-[#FACC15]" strokeWidth={1.5} />
              </div>
            </Card>

            <Card className="blueprint-card p-6 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-[#64748B] text-sm blueprint-label">Vector Chunks</p>
                  <p className="text-3xl font-bold text-[#0F172A] mt-2">
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (stats?.total_chunks || 0).toLocaleString()}
                  </p>
                  <p className="text-[#38BDF8] text-sm mt-2">Indexed snippets</p>
                </div>
                <Users className="w-8 h-8 text-[#38BDF8]" strokeWidth={1.5} />
              </div>
            </Card>

            <Card className="blueprint-card p-6 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-[#64748B] text-sm blueprint-label">Indexed Repos</p>
                  <p className="text-3xl font-bold text-[#0F172A] mt-2">
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : stats?.repositories_indexed || 0}
                  </p>
                  <p className="text-[#38BDF8] text-sm mt-2">Total codebases</p>
                </div>
                <Clock className="w-8 h-8 text-[#1E3A8A]" strokeWidth={1.5} />
              </div>
            </Card>
          </div>

          {/* Charts */}
          <Tabs defaultValue="queries" className="space-y-6">
            <TabsList className="bg-white border-2 border-[#E2E8F0]">
              <TabsTrigger value="queries">Query Trends</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="engagement">User Engagement</TabsTrigger>
            </TabsList>

            <TabsContent value="queries" className="space-y-6">
              <Card className="blueprint-card p-6 bg-white blueprint-graph">
                <h3 className="text-xl font-semibold text-[#0F172A] mb-6 flex items-center gap-2">
                  <div className="w-1 h-6 bg-[#1E3A8A]"></div>
                  Query Volume & Accuracy Over Time
                </h3>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={queryTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="date" stroke="#64748B" style={{ fontSize: '12px' }} />
                    <YAxis yAxisId="left" stroke="#64748B" style={{ fontSize: '12px' }} />
                    <YAxis yAxisId="right" orientation="right" stroke="#64748B" style={{ fontSize: '12px' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#FFFFFF', border: '2px solid #1E3A8A', borderRadius: '4px' }}
                      labelStyle={{ color: '#0F172A', fontWeight: 600 }}
                    />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="queries" stroke="#1E3A8A" strokeWidth={2} name="Queries" dot={{ fill: '#1E3A8A', strokeWidth: 2, r: 4 }} />
                    <Line yAxisId="right" type="monotone" dataKey="accuracy" stroke="#38BDF8" strokeWidth={2} name="Accuracy %" dot={{ fill: '#38BDF8', strokeWidth: 2, r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              {/* Top Queries Table */}
              <Card className="blueprint-card p-6 bg-white">
                <h3 className="text-xl font-semibold text-[#0F172A] mb-6 flex items-center gap-2">
                  <div className="w-1 h-6 bg-[#1E3A8A]"></div>
                  Most Frequent Queries
                </h3>
                <div className="space-y-3">
                  {topQueries.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border-2 border-[#E2E8F0] rounded-sm hover:border-[#38BDF8] transition-colors">
                      <div className="flex items-center gap-4 flex-1">
                        <span className="text-2xl font-bold text-[#CBD5E1]">{idx + 1}</span>
                        <div className="flex-1">
                          <p className="text-[#0F172A]">{item.query}</p>
                          <p className="text-[#64748B] text-sm blueprint-label">{item.count} queries</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[#38BDF8] font-semibold">{item.accuracy}%</p>
                        <p className="text-[#64748B] text-sm blueprint-label">accuracy</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* Category, Performance, and Engagement tabs commented out as they use dummy data */}
            {/* 
            <TabsContent value="categories">...</TabsContent>
            <TabsContent value="performance">...</TabsContent>
            <TabsContent value="engagement">...</TabsContent>
            */}
          </Tabs>
        </div>
      </main>
    </div>
  );
}
