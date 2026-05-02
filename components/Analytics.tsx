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

interface AnalyticsProps {
  navigateTo: (page: string) => void;
}

export function Analytics({ navigateTo }: AnalyticsProps) {
  const queryTrendData = [
    { date: "Mon", queries: 145, accuracy: 84 },
    { date: "Tue", queries: 189, accuracy: 86 },
    { date: "Wed", queries: 167, accuracy: 85 },
    { date: "Thu", queries: 203, accuracy: 88 },
    { date: "Fri", queries: 198, accuracy: 87 },
    { date: "Sat", queries: 134, accuracy: 89 },
    { date: "Sun", queries: 112, accuracy: 86 },
  ];

  const categoryData = [
    { name: "Architecture", value: 320, color: "#1E3A8A" },
    { name: "Code Patterns", value: 450, color: "#38BDF8" },
    { name: "Error Analysis", value: 280, color: "#EF4444" },
    { name: "Documentation", value: 190, color: "#FACC15" },
    { name: "Performance", value: 160, color: "#64748B" },
  ];

  const responseTimeData = [
    { time: "00:00", avgTime: 1.1 },
    { time: "04:00", avgTime: 0.9 },
    { time: "08:00", avgTime: 1.4 },
    { time: "12:00", avgTime: 1.6 },
    { time: "16:00", avgTime: 1.8 },
    { time: "20:00", avgTime: 1.3 },
  ];

  const topQueries = [
    { query: "Why was JWT deprecated?", count: 47, accuracy: 92 },
    { query: "Explain caching strategy", count: 38, accuracy: 88 },
    { query: "Show recurring errors", count: 34, accuracy: 91 },
    { query: "Architecture evolution", count: 29, accuracy: 85 },
    { query: "Database migration issues", count: 25, accuracy: 87 },
  ];

  const userEngagement = [
    { name: "Engineering Team", queries: 1240, avgAccuracy: 88 },
    { name: "DevOps", queries: 680, avgAccuracy: 91 },
    { name: "QA Team", queries: 420, avgAccuracy: 85 },
    { name: "Product", queries: 190, avgAccuracy: 82 },
  ];

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
          {/* KPI Cards */}
          <div className="grid grid-cols-4 gap-6">
            <Card className="blueprint-card p-6 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-[#64748B] text-sm blueprint-label">Total Queries</p>
                  <p className="text-3xl font-bold text-[#0F172A] mt-2">2,847</p>
                  <p className="text-[#38BDF8] text-sm mt-2">+12.4% vs last week</p>
                </div>
                <TrendingUp className="w-8 h-8 text-[#1E3A8A]" strokeWidth={1.5} />
              </div>
            </Card>

            <Card className="blueprint-card p-6 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-[#64748B] text-sm blueprint-label">Avg Accuracy</p>
                  <p className="text-3xl font-bold text-[#0F172A] mt-2">87.4%</p>
                  <p className="text-[#FACC15] text-sm mt-2">+3.2% improvement</p>
                </div>
                <Target className="w-8 h-8 text-[#FACC15]" strokeWidth={1.5} />
              </div>
            </Card>

            <Card className="blueprint-card p-6 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-[#64748B] text-sm blueprint-label">Active Users</p>
                  <p className="text-3xl font-bold text-[#0F172A] mt-2">142</p>
                  <p className="text-[#38BDF8] text-sm mt-2">Across 4 teams</p>
                </div>
                <Users className="w-8 h-8 text-[#38BDF8]" strokeWidth={1.5} />
              </div>
            </Card>

            <Card className="blueprint-card p-6 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-[#64748B] text-sm blueprint-label">Avg Response</p>
                  <p className="text-3xl font-bold text-[#0F172A] mt-2">1.2s</p>
                  <p className="text-[#38BDF8] text-sm mt-2">-0.3s faster</p>
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

            <TabsContent value="categories">
              <Card className="blueprint-card p-6 bg-white">
                <h3 className="text-xl font-semibold text-[#0F172A] mb-6 flex items-center gap-2">
                  <div className="w-1 h-6 bg-[#1E3A8A]"></div>
                  Query Distribution by Category
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        stroke="#FFFFFF"
                        strokeWidth={2}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#FFFFFF', border: '2px solid #1E3A8A' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="space-y-4">
                    {categoryData.map((category, idx) => (
                      <div key={idx} className="p-4 border-2 border-[#E2E8F0] rounded-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-sm border-2" style={{ borderColor: category.color, backgroundColor: category.color }}></div>
                            <span className="text-[#0F172A] font-medium">{category.name}</span>
                          </div>
                          <span className="text-[#64748B]">{category.value}</span>
                        </div>
                        <div className="w-full bg-[#F8FAFC] rounded-sm h-2 border border-[#E2E8F0]">
                          <div 
                            className="h-full rounded-sm" 
                            style={{ 
                              backgroundColor: category.color, 
                              width: `${(category.value / 1400) * 100}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="performance">
              <Card className="blueprint-card p-6 bg-white blueprint-graph">
                <h3 className="text-xl font-semibold text-[#0F172A] mb-6 flex items-center gap-2">
                  <div className="w-1 h-6 bg-[#1E3A8A]"></div>
                  Response Time Analysis
                </h3>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={responseTimeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="time" stroke="#64748B" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#64748B" style={{ fontSize: '12px' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#FFFFFF', border: '2px solid #1E3A8A' }}
                      labelStyle={{ color: '#0F172A' }}
                    />
                    <Legend />
                    <Bar dataKey="avgTime" fill="#1E3A8A" name="Avg Response Time (s)" stroke="#1E3A8A" strokeWidth={1} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </TabsContent>

            <TabsContent value="engagement">
              <Card className="blueprint-card p-6 bg-white">
                <h3 className="text-xl font-semibold text-[#0F172A] mb-6 flex items-center gap-2">
                  <div className="w-1 h-6 bg-[#1E3A8A]"></div>
                  Team Engagement Metrics
                </h3>
                <div className="space-y-4">
                  {userEngagement.map((team, idx) => (
                    <div key={idx} className="p-6 border-2 border-[#E2E8F0] rounded-sm hover:border-[#1E3A8A] transition-colors">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-[#0F172A] font-semibold">{team.name}</h4>
                          <p className="text-[#64748B] text-sm blueprint-label">{team.queries} total queries</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[#38BDF8] font-semibold text-xl">{team.avgAccuracy}%</p>
                          <p className="text-[#64748B] text-sm blueprint-label">avg accuracy</p>
                        </div>
                      </div>
                      <div className="w-full bg-[#F8FAFC] rounded-sm h-3 border border-[#E2E8F0]">
                        <div 
                          className="bg-[#1E3A8A] h-full rounded-sm" 
                          style={{ width: `${(team.queries / 1240) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
