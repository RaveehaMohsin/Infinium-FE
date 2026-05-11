"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ModelAccuracyPanel } from "@/components/ModelAccuracyPanel";
import { Activity, BarChart3, TrendingUp, ThumbsUp, ThumbsDown, Clock } from "lucide-react";

interface FeedbackProps {
  navigateTo: (page: string) => void;
}

export function Feedback({ navigateTo }: FeedbackProps) {
  const [activeTab, setActiveTab] = useState("accuracy");

  return (
    <div className="flex h-screen bg-white">
      <Sidebar currentPage="feedback" navigateTo={navigateTo} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white px-8 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Feedback Analytics</h1>
              <p className="text-gray-600 text-sm">Track user satisfaction and model performance</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === "accuracy" ? (
              <ModelAccuracyPanel navigateTo={navigateTo} />
            ) : (
              <div className="bg-white rounded-xl border-2 border-gray-200 p-8 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Performance Insights</h3>
                <p className="text-gray-500">Coming soon. Detailed performance metrics will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}