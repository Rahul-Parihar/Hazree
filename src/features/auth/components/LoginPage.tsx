"use client";

import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  ArrowRight,
  Clock,
  AlertCircle,
  ShieldCheck,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { useAppDispatch } from "@/redux/hooks";
import { loginAsync } from "@/redux/slices/authSlice";
import { EmployeeProfile } from "@/types/customer";
import ResetPasswordModal from "./ResetPasswordModal";

interface LoginPageProps {
  onLoginSuccess: (profile: EmployeeProfile) => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [stayLoggedIn, setStayLoggedIn] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);
  const [isResetOpen, setIsResetOpen] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage("Please enter your employee email address.");
      return;
    }
    if (!password.trim()) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setErrorMessage(null);
    setSuccessInfo(null);
    setIsLoading(true);

    try {
      const resultAction = await dispatch(
        loginAsync({
          email: email.trim(),
          password: password.trim(),
        })
      );

      if (loginAsync.fulfilled.match(resultAction)) {
        setSuccessInfo(`Welcome back, ${resultAction.payload.profile.fullName}!`);
        setTimeout(() => {
          onLoginSuccess(resultAction.payload.profile);
        }, 400);
      } else {
        setIsLoading(false);
        setErrorMessage(
          (resultAction.payload as string) ||
            "Failed to sign in. Please verify your employee email and password."
        );
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(
        err?.message || "Failed to sign in. Please verify your employee email and password."
      );
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#e8edf4] text-slate-800 flex flex-col justify-between font-sans selection:bg-blue-500 selection:text-white">
      {/* Top Header: Pure White Full-Width Bar with Centered Logo & Name */}
      <header className="w-full bg-white border-b border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05)] py-3 px-4 flex justify-between items-center max-w-7xl mx-auto">
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
          <span className="text-lg sm:text-xl font-bold text-slate-800 font-sans tracking-normal">
            Hazree <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 ml-1 border border-blue-200">Customer & Employee Portal</span>
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="hidden sm:inline">Secure Employee Verification</span>
        </div>
      </header>

      {/* Main Centered Login Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-[440px] bg-white rounded-2xl shadow-xl border border-slate-100 p-8 sm:p-10 space-y-6">
          {/* Card Header */}
          <div className="text-center space-y-1">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <Building2 className="w-6 h-6" />
            </div>
            <h2 className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight">
              Employee Portal Log In
            </h2>
            <p className="text-xs text-slate-500">
              Enter the email & password configured by your company admin
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 shadow-sm animate-fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500 mt-0.5" />
              <div>
                <span className="font-bold block">Sign In Failed</span>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {successInfo && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2.5 shadow-sm animate-fade-in">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span className="font-semibold">{successInfo}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} autoComplete="on" className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-600"
              >
                Employee Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="e.g. aarav@tatatech.com"
                className="w-full px-3.5 py-2.5 bg-[#eef4fc] border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-600"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Enter employee password"
                  className="w-full px-3.5 py-2.5 bg-[#eef4fc] border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors p-1 cursor-pointer"
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
            <div className="flex items-center justify-between pt-0.5">
              <div className="flex items-center gap-2">
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
                  Remember login
                </label>
              </div>

              <button
                type="button"
                onClick={() => setIsResetOpen(true)}
                className="text-xs font-semibold text-[#1a73e8] hover:underline transition-colors cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            {/* Log In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-[#1a73e8] hover:bg-[#1557b0] active:bg-[#0d47a1] text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Notice */}
          <div className="pt-2 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400">
              Need access? Contact your Company Administrator to register your staff account.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} Hazree Attendance & Workforce Management Platform
      </footer>

      {/* Reset Password Modal */}
      <ResetPasswordModal
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
      />
    </div>
  );
}
