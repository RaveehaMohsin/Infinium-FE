import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Database,
  Palette,
  Globe,
  Key,
  Save,
  CheckCircle2
} from "lucide-react";

interface SettingsProps {
  navigateTo: (page: string) => void;
}

export function Settings({ navigateTo }: SettingsProps) {
  const [activeTab, setActiveTab] = useState("profile");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "data", label: "Data & Privacy", icon: Database },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "api", label: "API Keys", icon: Key },
  ];

  return (
    <div className="flex h-screen bg-white">
      <Sidebar currentPage="settings" navigateTo={navigateTo} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg">
                <SettingsIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl">Settings</h1>
                <p className="text-gray-600 text-sm">Manage your account and preferences</p>
              </div>
            </div>
            {saved && (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-medium">Settings saved</span>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Sidebar Tabs */}
          <div className="w-64 border-r border-gray-200 bg-gray-50 p-4">
            <div className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === tab.id
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-gray-700 hover:bg-white"
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-3xl">
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
                    <p className="text-gray-600 mb-6">Manage your personal information</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        defaultValue="John Doe"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        defaultValue="john@example.com"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Organization</label>
                      <input
                        type="text"
                        defaultValue="Acme Inc."
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                      <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none">
                        <option>Developer</option>
                        <option>Team Lead</option>
                        <option>Manager</option>
                        <option>Admin</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
                    <p className="text-gray-600 mb-6">Choose how you want to be notified</p>
                  </div>

                  <div className="space-y-4">
                    {[
                      { title: "Email Notifications", desc: "Receive updates via email" },
                      { title: "Slack Notifications", desc: "Get notified in Slack" },
                      { title: "Weekly Digest", desc: "Summary of insights and activity" },
                      { title: "Error Alerts", desc: "Immediate alerts for critical errors" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div>
                          <p className="font-medium text-gray-900">{item.title}</p>
                          <p className="text-sm text-gray-600">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === "security" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Security Settings</h2>
                    <p className="text-gray-600 mb-6">Manage your account security</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div className="pt-4">
                      <button className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                        Update Password
                      </button>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="font-semibold mb-4">Two-Factor Authentication</h3>
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-green-900">2FA Enabled</p>
                          <p className="text-sm text-green-700">Your account is protected</p>
                        </div>
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* API Keys Tab */}
              {activeTab === "api" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-4">API Keys</h2>
                    <p className="text-gray-600 mb-6">Manage your API access keys</p>
                  </div>

                  <div className="space-y-4">
                    <div className="p-6 bg-gray-50 border-2 border-gray-200 rounded-xl">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="font-medium text-gray-900">Production API Key</p>
                          <p className="text-sm text-gray-600">Created on Jan 15, 2025</p>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Active</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <code className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg font-mono text-sm">
                          inf_prod_••••••••••••••••
                        </code>
                        <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-sm">
                          Copy
                        </button>
                      </div>
                    </div>

                    <button className="w-full px-6 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-colors text-gray-600 hover:text-blue-600">
                      + Generate New API Key
                    </button>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="pt-8 border-t border-gray-200 mt-8">
                <button
                  onClick={handleSave}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
