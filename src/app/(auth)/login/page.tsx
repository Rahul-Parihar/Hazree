'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAppDispatch } from '../../../redux/hooks';
import { loginSuperAdminAsync } from '../../../redux/slices/authSlice';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('admin@hazree.com');
  const [password, setPassword] = useState('Admin@123456');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const resultAction = await dispatch(loginSuperAdminAsync({ email, password }));
      if (loginSuperAdminAsync.fulfilled.match(resultAction)) {
        setIsLoading(false);
        router.push('/');
      } else {
        const errorDetail = (resultAction.payload as string) || 'Authentication failed';
        setErrorMessage(errorDetail);
        setIsLoading(false);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Network connection failed. Please ensure backend is running.');
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col font-sans overflow-hidden">
      {/* Full-screen Background Image */}
      <img
        src="/assets/img/login-bg.jpg"
        alt="Office background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dark Blue Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/90 via-indigo-950/85 to-slate-950/90" />

      {/* Top-Left Logo */}
      <div className="relative z-10 flex items-center gap-3 px-8 pt-8 lg:px-12 lg:pt-10">
        {/* Hazree Logo Icon */}
        <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="6" r="2.5" fill="white"/>
            <circle cx="6" cy="12" r="2.5" fill="white"/>
            <circle cx="18" cy="12" r="2.5" fill="white"/>
            <circle cx="12" cy="18" r="2.5" fill="white"/>
            <line x1="12" y1="8.5" x2="12" y2="15.5" stroke="white" strokeWidth="1.5"/>
            <line x1="8.5" y1="12" x2="15.5" y2="12" stroke="white" strokeWidth="1.5"/>
            <line x1="9" y1="9" x2="15" y2="15" stroke="white" strokeWidth="1.2"/>
            <line x1="15" y1="9" x2="9" y2="15" stroke="white" strokeWidth="1.2"/>
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white leading-none">
            HAZREE
          </h1>
          <p className="text-[11px] text-blue-200/70 font-medium tracking-widest uppercase">
            Attendance Platform
          </p>
        </div>
      </div>

      {/* Centered Login Form */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          {/* Login Heading */}
          <div className="text-center">
            <h2 className="text-4xl font-black text-white italic tracking-tight">Super Admin Login</h2>
            <p className="text-base text-blue-100/70 mt-2 font-medium">Enter your credentials to access portal.</p>
          </div>

          {/* Form Card */}
          <form onSubmit={handleSubmit} className="space-y-5 bg-white/10 backdrop-blur-xl p-8 rounded-2xl border border-white/20 shadow-2xl">
            {/* Error Message Display */}
            {errorMessage && (
              <div className="p-4 rounded-xl bg-rose-500/20 border border-rose-500/50 text-xs font-bold text-rose-200 flex items-start gap-3 animate-fade-in shadow-lg">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="login-email" className="block text-sm font-bold text-white tracking-wide">
                E-mail Address
              </label>
              <div className="relative">
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="admin@hazree.com"
                  className="w-full px-4 py-3.5 bg-white text-slate-900 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 border border-white/20 shadow-lg font-medium"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="login-password" className="block text-sm font-bold text-white tracking-wide">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3.5 bg-white text-slate-900 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 border border-white/20 shadow-lg pr-12 font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Reset Password */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-white/40 bg-white/10 text-amber-500 focus:ring-amber-400 focus:ring-offset-0"
                />
                <span className="text-sm text-white/80 font-medium">Remember me</span>
              </label>
              <a
                href="#"
                className="text-sm font-bold text-white hover:text-amber-400 transition-colors"
              >
                Reset Password?
              </a>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-extrabold text-base rounded-lg transition-all duration-200 shadow-lg shadow-amber-500/30 hover:shadow-amber-400/40 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="inline-block w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Super Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-950/60 to-transparent z-[1]" />
    </div>
  );
}
