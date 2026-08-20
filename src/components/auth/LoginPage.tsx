"use client";

import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  ArrowRight,
  Clock,
  AlertCircle,
} from "lucide-react";
import ResetPasswordModal from "./ResetPasswordModal";
import { toast } from "sonner";

interface LoginPageProps {
  onLoginSuccess: (email: string) => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [stayLoggedIn, setStayLoggedIn] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isResetOpen, setIsResetOpen] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }
    if (!password.trim()) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      toast.success(`Welcome back! Signed in as ${email}`);
      onLoginSuccess(email);
    }, 600);
  };

  return (
    <div className="min-h-screen w-full bg-[#e8edf4] text-slate-800 flex flex-col justify-between font-sans selection:bg-blue-500 selection:text-white">
      {/* Top Header: Pure White Full-Width Bar with Centered Logo & Name exactly like reference photo */}
      <header className="w-full bg-white border-b border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05)] py-3 px-4 flex justify-center items-center">
        <div className="flex items-center gap-2.5">
          {/* Circular Brand Icon */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-blue-600 p-0.5 flex items-center justify-center shadow-xs">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white">
                  <Clock className="w-3 h-3 text-white stroke-[2.5]" />
                </div>
              </div>
            </div>
            <span className="text-[7px] font-bold text-cyan-600 uppercase tracking-tighter -mt-0.5">
              Hazree
            </span>
          </div>

          {/* Brand Name Text */}
          <span className="text-lg sm:text-xl font-medium text-slate-800 font-sans tracking-normal">
            Hazree
          </span>
        </div>
      </header>

      {/* Main Centered Login Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-[440px] bg-white rounded-xl shadow-lg border border-slate-100 p-8 sm:p-10 space-y-6">
          {/* Card Title */}
          <h2 className="text-2xl sm:text-[26px] font-medium text-center text-slate-800 tracking-tight">
            Log In
          </h2>

          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} autoComplete="off" className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-medium text-slate-600"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="off"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Enter your email address"
                className="w-full px-3.5 py-2.5 bg-[#eef4fc] border border-slate-300 rounded-md text-sm text-slate-900 placeholder-slate-400 font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-medium text-slate-600"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Enter your password"
                  className="w-full px-3.5 py-2.5 bg-[#eef4fc] border border-slate-300 rounded-md text-sm text-slate-900 placeholder-slate-400 font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot password link */}
            <div>
              <button
                type="button"
                onClick={() => setIsResetOpen(true)}
                className="text-xs font-normal text-[#1a73e8] hover:underline transition-colors"
              >
                Forgot your password?
              </button>
            </div>

            {/* Stay logged in checkbox */}
            <div className="flex items-center gap-2 pt-0.5">
              <input
                id="stayLoggedIn"
                type="checkbox"
                checked={stayLoggedIn}
                onChange={(e) => setStayLoggedIn(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#1a73e8] focus:ring-blue-500 cursor-pointer"
              />
              <label
                htmlFor="stayLoggedIn"
                className="text-xs text-slate-600 cursor-pointer select-none font-normal"
              >
                Stay logged in
              </label>
            </div>

            {/* Log In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-[#1a73e8] hover:bg-[#1557b0] active:bg-[#0d47a1] text-white text-sm font-medium rounded-md shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Log In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Footer spacer */}
      <footer className="w-full pb-4"></footer>

      {/* Reset Password Modal */}
      <ResetPasswordModal
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
      />
    </div>
  );
}
