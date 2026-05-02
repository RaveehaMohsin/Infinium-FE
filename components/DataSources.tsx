import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import {
  GitBranch,
  Database,
  Activity,
  Plus,
  RefreshCw,
  Settings,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  ExternalLink
} from "lucide-react";

interface DataSourcesProps {
  navigateTo: (page: string) => void;
}

interface DataSource {
  id: string;
  name: string;
  type: string;
  icon: any;
  color: string;
  connected: boolean;
  lastSync?: string;
  itemsIndexed?: number;
  repositories?: Array<{ name: string; branch: string; commits: number }>;
  status: "active" | "syncing" | "error" | "disconnected";
}

export function DataSources({ navigateTo }: DataSourcesProps) {
  const [showAddModal, setShowAddModal] = useState(false);

  const connectedSources: DataSource[] = [
    {
      id: "github-1",
      name: "GitHub",
      type: "Version Control",
      icon: GitBranch,
      color: "purple",
      connected: true,
      lastSync: "2 minutes ago",
      itemsIndexed: 12547,
      repositories: [
        { name: "backend-api", branch: "main", commits: 2847 },
        { name: "frontend-web", branch: "main", commits: 1923 },
        { name: "mobile-app", branch: "develop", commits: 1456 },
      ],
      status: "active"
    },
    {
      id: "gitlab-1",
      name: "GitLab",
      type: "Version Control",
      icon: GitBranch,
      color: "orange",
      connected: true,
      lastSync: "5 minutes ago",
      itemsIndexed: 8340,
      repositories: [
        { name: "infrastructure", branch: "main", commits: 1234 },
        { name: "devops-tools", branch: "main", commits: 892 },
      ],
      status: "active"
    },
    {
      id: "sentry-1",
      name: "Sentry",
      type: "Error Tracking",
      icon: AlertCircle,
      color: "red",
      connected: true,
      lastSync: "1 minute ago",
      itemsIndexed: 15230,
      status: "syncing"
    },
  ];

  const availableSources = [
    { id: "github", name: "GitHub", icon: GitBranch, description: "Connect your GitHub repositories", color: "purple" },
    { id: "gitlab", name: "GitLab", icon: GitBranch, description: "Connect your GitLab projects", color: "orange" },
    { id: "bitbucket", name: "Bitbucket", icon: Database, description: "Connect Bitbucket repositories", color: "blue" },
    { id: "jira", name: "Jira", icon: Activity, description: "Import issues and project data", color: "blue" },
    { id: "confluence", name: "Confluence", icon: Database, description: "Index documentation pages", color: "blue" },
    { id: "slack", name: "Slack", icon: Database, description: "Index team conversations", color: "purple" },
    { id: "sentry", name: "Sentry", icon: AlertCircle, description: "Track errors and exceptions", color: "red" },
    { id: "datadog", name: "Datadog", icon: Activity, description: "Monitor performance metrics", color: "purple" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Active</span>
          </div>
        );
      case "syncing":
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Syncing</span>
          </div>
        );
      case "error":
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Error</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-white">
      <Sidebar currentPage="datasources" navigateTo={navigateTo} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
                <Database className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl">Data Sources</h1>
                <p className="text-gray-600 text-sm">Connect and manage your knowledge sources</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-colors flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Sync All
              </button>
              <button
                onClick={() => setShowAddModal(!showAddModal)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Source
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border-2 border-purple-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Connected Sources</span>
                  <Database className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-3xl font-semibold text-gray-900">{connectedSources.length}</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Items Indexed</span>
                  <Activity className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-3xl font-semibold text-gray-900">
                  {connectedSources.reduce((sum, s) => sum + (s.itemsIndexed || 0), 0).toLocaleString()}
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Last Sync</span>
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-3xl font-semibold text-gray-900">1m</div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border-2 border-orange-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Sync Status</span>
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-3xl font-semibold text-gray-900">100%</div>
              </div>
            </div>

            {/* Connected Sources */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Connected Sources</h2>
              <div className="space-y-4">
                {connectedSources.map((source) => {
                  const Icon = source.icon;
                  return (
                    <div key={source.id} className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-blue-300 transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 bg-gradient-to-br from-${source.color}-500 to-${source.color}-600 rounded-xl`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{source.name}</h3>
                            <p className="text-sm text-gray-600">{source.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(source.status)}
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Settings className="w-5 h-5 text-gray-600" />
                          </button>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-xl">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Last Sync</p>
                          <p className="text-sm font-medium text-gray-900">{source.lastSync}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Items Indexed</p>
                          <p className="text-sm font-medium text-gray-900">{source.itemsIndexed?.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Repositories</p>
                          <p className="text-sm font-medium text-gray-900">{source.repositories?.length || 0}</p>
                        </div>
                      </div>

                      {/* Repositories */}
                      {source.repositories && source.repositories.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700">Connected Repositories</p>
                          <div className="grid grid-cols-3 gap-3">
                            {source.repositories.map((repo, idx) => (
                              <div key={idx} className="p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                                <div className="flex items-start justify-between mb-1">
                                  <p className="text-sm font-medium text-gray-900">{repo.name}</p>
                                  <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                                </div>
                                <p className="text-xs text-gray-500">{repo.branch} • {repo.commits} commits</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
                        <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm">
                          <RefreshCw className="w-4 h-4" />
                          Sync Now
                        </button>
                        <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm">
                          <Settings className="w-4 h-4" />
                          Configure
                        </button>
                        <button className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2 text-sm ml-auto">
                          <Trash2 className="w-4 h-4" />
                          Disconnect
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Available Sources */}
            {showAddModal && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Available Sources</h2>
                <div className="grid grid-cols-4 gap-4">
                  {availableSources.map((source) => {
                    const Icon = source.icon;
                    const isConnected = connectedSources.some(s => s.name === source.name);

                    return (
                      <button
                        key={source.id}
                        disabled={isConnected}
                        className={`p-6 rounded-xl border-2 transition-all text-left ${isConnected
                            ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                            : "border-gray-200 hover:border-blue-300 hover:shadow-lg"
                          }`}
                      >
                        <div className={`w-12 h-12 bg-gradient-to-br from-${source.color}-500 to-${source.color}-600 rounded-xl flex items-center justify-center mb-3`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">{source.name}</h3>
                        <p className="text-sm text-gray-600">{source.description}</p>
                        {isConnected && (
                          <div className="mt-3 flex items-center gap-1 text-xs text-green-600">
                            <CheckCircle2 className="w-3 h-3" />
                            Connected
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
