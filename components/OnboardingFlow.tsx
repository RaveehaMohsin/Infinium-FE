"use client";

import { useState } from "react";
import {
    Brain,
    Building2,
    Users,
    GitBranch,
    MessageSquare,
    Shield,
    ArrowRight,
    ArrowLeft,
    Check
} from "lucide-react";

interface OnboardingFlowProps {
    onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [orgData, setOrgData] = useState({
        organizationName: "",
        teamSize: "",
        industry: ""
    });
    const [selectedSources, setSelectedSources] = useState<string[]>([]);
    const [permissions, setPermissions] = useState({
        autoSync: true,
        teamAccess: true,
        notifications: true
    });

    const totalSteps = 3;

    const handleNext = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        } else {
            onComplete();
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const toggleDataSource = (source: string) => {
        setSelectedSources(prev =>
            prev.includes(source)
                ? prev.filter(s => s !== source)
                : [...prev, source]
        );
    };

    return (
        <div className="min-h-screen bg-white flex">
            {/* Left Side - Form */}
            <div className="flex-1 flex items-center justify-center p-12">
                <div className="w-full max-w-2xl">
                    {/* Logo */}
                    <div className="inline-flex items-center gap-2 mb-8">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                            <Brain className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-['Space_Grotesk']">Infinium</span>
                    </div>

                    {/* Progress Indicator */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            {[1, 2, 3].map((step) => (
                                <div key={step} className="flex items-center flex-1">
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${step < currentStep
                                            ? "bg-blue-600 border-blue-600 text-white"
                                            : step === currentStep
                                                ? "border-blue-600 text-blue-600 bg-blue-50"
                                                : "border-gray-300 text-gray-400"
                                        }`}>
                                        {step < currentStep ? (
                                            <Check className="w-5 h-5" />
                                        ) : (
                                            <span className="font-['Space_Grotesk']">{step}</span>
                                        )}
                                    </div>
                                    {step < 3 && (
                                        <div className={`flex-1 h-0.5 mx-2 ${step < currentStep ? "bg-blue-600" : "bg-gray-300"
                                            }`}></div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between text-sm font-['Inter']">
                            <span className={currentStep === 1 ? "text-blue-600 font-medium" : "text-gray-500"}>
                                Organization
                            </span>
                            <span className={currentStep === 2 ? "text-blue-600 font-medium" : "text-gray-500"}>
                                Data Sources
                            </span>
                            <span className={currentStep === 3 ? "text-blue-600 font-medium" : "text-gray-500"}>
                                Permissions
                            </span>
                        </div>
                    </div>

                    {/* Step 1: Organization Setup */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-3xl font-['Space_Grotesk'] mb-2">
                                    Set up your organization
                                </h2>
                                <p className="text-gray-600 font-['Inter']">
                                    Tell us about your team to personalize your experience
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm mb-2 font-['Inter'] font-medium">
                                        Organization Name
                                    </label>
                                    <input
                                        type="text"
                                        value={orgData.organizationName}
                                        onChange={(e) => setOrgData({ ...orgData, organizationName: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 font-['Inter']"
                                        placeholder="Acme Inc."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm mb-2 font-['Inter'] font-medium">
                                        Team Size
                                    </label>
                                    <select
                                        value={orgData.teamSize}
                                        onChange={(e) => setOrgData({ ...orgData, teamSize: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 font-['Inter']"
                                    >
                                        <option value="">Select team size</option>
                                        <option value="1-10">1-10 developers</option>
                                        <option value="11-50">11-50 developers</option>
                                        <option value="51-200">51-200 developers</option>
                                        <option value="200+">200+ developers</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm mb-2 font-['Inter'] font-medium">
                                        Industry
                                    </label>
                                    <select
                                        value={orgData.industry}
                                        onChange={(e) => setOrgData({ ...orgData, industry: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 font-['Inter']"
                                    >
                                        <option value="">Select industry</option>
                                        <option value="technology">Technology</option>
                                        <option value="finance">Finance</option>
                                        <option value="healthcare">Healthcare</option>
                                        <option value="ecommerce">E-commerce</option>
                                        <option value="education">Education</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Data Sources */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-3xl font-['Space_Grotesk'] mb-2">
                                    Connect your data sources
                                </h2>
                                <p className="text-gray-600 font-['Inter']">
                                    Select the platforms Infinium should learn from
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { id: "github", name: "GitHub", icon: GitBranch, desc: "Repositories, commits, PRs" },
                                    { id: "gitlab", name: "GitLab", icon: GitBranch, desc: "Code and merge requests" },
                                    { id: "slack", name: "Slack", icon: MessageSquare, desc: "Team conversations" },
                                    { id: "jira", name: "Jira", icon: Building2, desc: "Issues and workflows" }
                                ].map((source) => {
                                    const Icon = source.icon;
                                    const isSelected = selectedSources.includes(source.id);

                                    return (
                                        <button
                                            key={source.id}
                                            onClick={() => toggleDataSource(source.id)}
                                            className={`p-6 rounded-xl border-2 transition-all text-left ${isSelected
                                                    ? "border-blue-500 bg-blue-50"
                                                    : "border-gray-200 hover:border-gray-300"
                                                }`}
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className={`p-2 rounded-lg ${isSelected ? "bg-blue-100" : "bg-gray-100"
                                                    }`}>
                                                    <Icon className={`w-6 h-6 ${isSelected ? "text-blue-600" : "text-gray-600"
                                                        }`} />
                                                </div>
                                                {isSelected && (
                                                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                                        <Check className="w-4 h-4 text-white" />
                                                    </div>
                                                )}
                                            </div>
                                            <h3 className="font-['Space_Grotesk'] text-lg mb-1">
                                                {source.name}
                                            </h3>
                                            <p className="text-sm text-gray-600 font-['Inter']">
                                                {source.desc}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                <p className="text-sm text-blue-900 font-['Inter']">
                                    <strong>Note:</strong> You can add more integrations later from the settings page.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Permissions */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-3xl font-['Space_Grotesk'] mb-2">
                                    Configure permissions
                                </h2>
                                <p className="text-gray-600 font-['Inter']">
                                    Set up access controls and preferences
                                </p>
                            </div>

                            <div className="space-y-4">
                                {[
                                    {
                                        id: "autoSync",
                                        title: "Automatic Synchronization",
                                        desc: "Keep your knowledge base updated with real-time changes from connected sources",
                                        icon: GitBranch
                                    },
                                    {
                                        id: "teamAccess",
                                        title: "Team-Wide Access",
                                        desc: "Allow all team members to query and contribute to the knowledge base",
                                        icon: Users
                                    },
                                    {
                                        id: "notifications",
                                        title: "Smart Notifications",
                                        desc: "Receive alerts about important insights and knowledge gaps",
                                        icon: MessageSquare
                                    }
                                ].map((perm) => {
                                    const Icon = perm.icon;

                                    return (
                                        <div
                                            key={perm.id}
                                            className="p-5 border border-gray-200 rounded-xl hover:border-gray-300 transition-all"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex gap-4 flex-1">
                                                    <div className="p-2 bg-gray-100 rounded-lg h-fit">
                                                        <Icon className="w-5 h-5 text-gray-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-['Space_Grotesk'] text-lg mb-1">
                                                            {perm.title}
                                                        </h3>
                                                        <p className="text-sm text-gray-600 font-['Inter']">
                                                            {perm.desc}
                                                        </p>
                                                    </div>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={permissions[perm.id as keyof typeof permissions]}
                                                        onChange={(e) => setPermissions({
                                                            ...permissions,
                                                            [perm.id]: e.target.checked
                                                        })}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                </label>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                                <div className="flex gap-3">
                                    <Shield className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="text-sm text-purple-900 mb-1 font-['Space_Grotesk']">
                                            Privacy & Security
                                        </h3>
                                        <p className="text-xs text-purple-700 leading-relaxed font-['Inter']">
                                            All data is encrypted and stored securely. Infinium only accesses repositories and data you explicitly authorize.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex gap-4 mt-8">
                        {currentStep > 1 && (
                            <button
                                onClick={handleBack}
                                className="px-6 py-3 rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors flex items-center gap-2 font-['Inter']"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                Back
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            className="flex-1 bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 font-['Inter']"
                        >
                            {currentStep === totalSteps ? "Complete Setup" : "Continue"}
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Skip Option */}
                    <div className="text-center mt-4">
                        <button
                            onClick={onComplete}
                            className="text-sm text-gray-500 hover:text-gray-700 font-['Inter']"
                        >
                            Skip for now
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Side - Visual Guide */}
            <div className="hidden lg:flex flex-1 bg-gradient-to-br from-purple-50 to-blue-50 p-12 items-center justify-center">
                <div className="max-w-md">
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                                <Building2 className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-['Space_Grotesk'] text-gray-900">
                                Personalize Your Experience
                            </h3>
                            <p className="text-gray-600 font-['Inter'] leading-relaxed">
                                Help us understand your organization so we can tailor Infinium's learning and insights to your team's specific needs.
                            </p>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center">
                                <GitBranch className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-['Space_Grotesk'] text-gray-900">
                                Connect Your Knowledge
                            </h3>
                            <p className="text-gray-600 font-['Inter'] leading-relaxed">
                                Infinium learns from your repositories, conversations, and workflows to build a comprehensive understanding of your development practices.
                            </p>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                                <Shield className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-['Space_Grotesk'] text-gray-900">
                                Secure & Controlled
                            </h3>
                            <p className="text-gray-600 font-['Inter'] leading-relaxed">
                                You're in control. Configure how Infinium accesses and shares knowledge while maintaining your organization's security standards.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
