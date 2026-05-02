import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import {
  Plug,
  Code,
  MessageSquare,
  Download,
  CheckCircle2,
  Settings,
  ExternalLink,
  Zap,
  Terminal,
  Globe
} from "lucide-react";

interface IntegrationsProps {
  navigateTo: (page: string) => void;
}

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: string;
  status: "active" | "available" | "coming-soon";
  color: string;
  features?: string[];
  setupGuide?: string;
}

export function Integrations({ navigateTo }: IntegrationsProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const integrations: Integration[] = [
    {
      id: "vscode",
      name: "VSCode Extension",
      description: "Get contextual insights directly in your IDE",
      icon: Code,
      category: "IDE",
      status: "active",
      color: "blue",
      features: ["Inline queries", "Code context", "Decision history", "Error insights"],
      setupGuide: "Install from VSCode Marketplace"
    },
    {
      id: "slack",
      name: "Slack Bot",
      description: "Query Infinium from your Slack workspace",
      icon: MessageSquare,
      category: "Communication",
      status: "active",
      color: "purple",
      features: ["Channel integration", "Direct messages", "Slash commands", "Notifications"],
      setupGuide: "Add to Slack workspace"
    },
    {
      id: "cli",
      name: "Command Line Interface",
      description: "Access Infinium from your terminal",
      icon: Terminal,
      category: "Developer Tools",
      status: "active",
      color: "green",
      features: ["Terminal queries", "Scripting support", "CI/CD integration", "Batch operations"],
      setupGuide: "npm install -g infinium-cli"
    },
    {
      id: "api",
      name: "REST API",
      description: "Integrate Infinium into your applications",
      icon: Globe,
      category: "API",
      status: "active",
      color: "orange",
      features: ["RESTful endpoints", "Authentication", "Webhooks", "Rate limiting"],
      setupGuide: "View API documentation"
    },
    {
      id: "jetbrains",
      name: "JetBrains Plugin",
      description: "IntelliJ, PyCharm, WebStorm integration",
      icon: Code,
      category: "IDE",
      status: "coming-soon",
      color: "red",
      features: ["IDE integration", "Code analysis", "Refactoring suggestions"],
      setupGuide: "Coming soon"
    },
    {
      id: "teams",
      name: "Microsoft Teams",
      description: "Collaborate with Infinium in Teams",
      icon: MessageSquare,
      category: "Communication",
      status: "coming-soon",
      color: "blue",
      features: ["Team channels", "Bot integration", "Notifications"],
      setupGuide: "Coming soon"
    },
  ];

  const categories = ["all", "IDE", "Communication", "Developer Tools", "API"];

  const filteredIntegrations = selectedCategory === "all"
    ? integrations
    : integrations.filter(i => i.category === selectedCategory);

  const activeIntegrations = integrations.filter(i => i.status === "active");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
            <CheckCircle2 className="w-3 h-3" />
            Active
          </div>
        );
      case "available":
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
            <Zap className="w-3 h-3" />
            Available
          </div>
        );
      case "coming-soon":
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
            Coming Soon
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-white">
      <Sidebar currentPage="integrations" navigateTo={navigateTo} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white px-8 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
              <Plug className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl">Integrations</h1>
              <p className="text-gray-600 text-sm">Connect Infinium with your favorite tools</p>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 px-8 py-6">
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Active Integrations</div>
              <div className="text-3xl font-semibold text-gray-900">{activeIntegrations.length}</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Total Available</div>
              <div className="text-3xl font-semibold text-gray-900">{integrations.length}</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Categories</div>
              <div className="text-3xl font-semibold text-gray-900">{categories.length - 1}</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="border-b border-gray-200 bg-gray-50 px-8 py-4">
          <div className="flex gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedCategory === cat
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-gray-700 border border-gray-200 hover:border-blue-300"
                  }`}
              >
                {cat === "all" ? "All" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            {/* VSCode Extension Highlight */}
            {selectedCategory === "all" || selectedCategory === "IDE" ? (
              <div className="mb-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border-2 border-blue-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                        <Code className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-semibold text-gray-900">VSCode Extension</h2>
                        <p className="text-gray-600">Most popular integration</p>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      Get Infinium's powerful reasoning capabilities directly in Visual Studio Code.
                      Query your codebase, view decision history, and get AI-powered insights without leaving your editor.
                    </p>
                    <div className="flex items-center gap-4 mb-4">
                      <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2">
                        <Download className="w-5 h-5" />
                        Download Extension
                      </button>
                      <button className="px-6 py-3 border-2 border-blue-300 text-blue-700 rounded-xl hover:bg-blue-50 transition-colors flex items-center gap-2">
                        <ExternalLink className="w-5 h-5" />
                        View Documentation
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {["Inline queries", "Code context", "Decision history", "Error insights"].map((feature, i) => (
                        <span key={i} className="px-3 py-1 bg-white border border-blue-200 rounded-full text-sm text-gray-700">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="hidden lg:block ml-8">
                    <div className="w-48 h-48 bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-200">
                      <div className="flex flex-col items-center justify-center h-full">
                        <Code className="w-20 h-20 text-blue-600 mb-3" />
                        <p className="text-sm font-semibold text-gray-700">VSCode</p>
                        <p className="text-xs text-gray-500">v1.0.0</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Integrations Grid */}
            <div className="grid grid-cols-2 gap-6">
              {filteredIntegrations.map((integration) => {
                const Icon = integration.icon;
                const isComingSoon = integration.status === "coming-soon";

                return (
                  <div
                    key={integration.id}
                    className={`bg-white rounded-xl border-2 p-6 transition-all ${isComingSoon
                        ? "border-gray-200 opacity-60"
                        : "border-gray-200 hover:border-blue-300 hover:shadow-lg"
                      }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 bg-gradient-to-br from-${integration.color}-500 to-${integration.color}-600 rounded-xl`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{integration.name}</h3>
                          <p className="text-sm text-gray-600">{integration.description}</p>
                        </div>
                      </div>
                      {getStatusBadge(integration.status)}
                    </div>

                    {integration.features && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-2">Features:</p>
                        <div className="flex flex-wrap gap-2">
                          {integration.features.map((feature, i) => (
                            <span key={i} className="px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {!isComingSoon && (
                      <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                          {integration.id === "vscode" ? "Download" : "Connect"}
                        </button>
                        <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <Settings className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
