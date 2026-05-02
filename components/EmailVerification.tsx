"use client";

import { useState } from "react";
import { Mail, ArrowRight, CheckCircle2, Brain } from "lucide-react";

interface EmailVerificationProps {
    email: string;
    onVerified: () => void;
}

export function EmailVerification({ email, onVerified }: EmailVerificationProps) {
    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState("");

    const handleCodeChange = (index: number, value: string) => {
        if (value.length > 1) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // Auto-focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`code-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            const prevInput = document.getElementById(`code-${index - 1}`);
            prevInput?.focus();
        }
    };

    const handleVerify = async () => {
        const verificationCode = code.join("");
        if (verificationCode.length !== 6) {
            setError("Please enter the complete verification code");
            return;
        }

        setIsVerifying(true);
        setError("");

        // Simulate verification
        setTimeout(() => {
            setIsVerifying(false);
            onVerified();
        }, 1500);
    };

    const handleResend = () => {
        setCode(["", "", "", "", "", ""]);
        setError("");
        // Simulate resend
        alert("Verification code resent to " + email);
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <div className="inline-flex items-center gap-2">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                            <Brain className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-['Space_Grotesk']">Infinium</span>
                    </div>
                </div>

                {/* Email Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                        <Mail className="w-8 h-8 text-blue-600" />
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-3xl font-['Space_Grotesk'] text-center mb-3">
                    Verify your email
                </h1>
                <p className="text-gray-600 text-center mb-8 font-['Inter']">
                    We've sent a verification code to<br />
                    <span className="font-medium text-gray-900">{email}</span>
                </p>

                {/* Code Input */}
                <div className="flex gap-3 justify-center mb-6">
                    {code.map((digit, index) => (
                        <input
                            key={index}
                            id={`code-${index}`}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleCodeChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            className="w-12 h-14 text-center text-2xl font-['Space_Grotesk'] border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                        />
                    ))}
                </div>

                {/* Error Message */}
                {error && (
                    <p className="text-red-500 text-sm text-center mb-4 font-['Inter']">
                        {error}
                    </p>
                )}

                {/* Verify Button */}
                <button
                    onClick={handleVerify}
                    disabled={isVerifying}
                    className="w-full bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 font-['Inter'] disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                >
                    {isVerifying ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Verifying...
                        </>
                    ) : (
                        <>
                            Verify Email
                            <ArrowRight className="w-5 h-5" />
                        </>
                    )}
                </button>

                {/* Resend */}
                <div className="text-center">
                    <button
                        onClick={handleResend}
                        className="text-sm text-gray-600 hover:text-gray-900 font-['Inter']"
                    >
                        Didn't receive the code? <span className="text-blue-600 font-medium">Resend</span>
                    </button>
                </div>

                {/* Info Box */}
                <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                    <div className="flex gap-3">
                        <CheckCircle2 className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-sm text-gray-900 mb-1 font-['Space_Grotesk']">
                                Why verify?
                            </h3>
                            <p className="text-xs text-gray-600 leading-relaxed font-['Inter']">
                                Email verification ensures secure access to your organization's knowledge base and enables important notifications.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
