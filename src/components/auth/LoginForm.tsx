'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Building2, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { UserRole } from '../../types';
import { useAppDispatch } from '../../redux/hooks';
import { login, loginSuperAdminAsync } from '../../redux/slices/authSlice';
import { toast } from 'sonner';

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [selectedRole, setSelectedRole] = useState<UserRole>('SUPER_ADMIN');
  const [email, setEmail] = useState('admin@hazree.com');
  const [password, setPassword] = useState('Admin@123456');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage(null);
    if (role === 'SUPER_ADMIN') {
      setEmail('admin@hazree.com');
      setPassword('Admin@123456');
    } else {
      setEmail('admin@tatatech.com');
      setPassword('TataAdminPass#1');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const resultAction = await dispatch(loginSuperAdminAsync({ email, password }));
      if (loginSuperAdminAsync.fulfilled.match(resultAction)) {
        setIsLoading(false);
        toast.success(`Welcome back! Signed in as ${email}`);
        router.push('/');
        return;
      } else {
        const errorDetail = (resultAction.payload as string) || 'Authentication failed';
        setErrorMessage(errorDetail);
        toast.error(errorDetail);
        setIsLoading(false);
        return;
      }
    } catch (err: any) {
      const msg = err?.message || 'Network connection failed. Please ensure backend is running.';
      setErrorMessage(msg);
      toast.error(msg);
      setIsLoading(false);
      return;
    }
  };



  return (
    <div className="w-full max-w-md space-y-6">
      {/* Role Selection Tabs */}
      <div className="bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80 flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => handleRoleSelect('SUPER_ADMIN')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            selectedRole === 'SUPER_ADMIN'
              ? 'bg-white text-emerald-600 shadow-sm border border-emerald-500/20'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Super Admin</span>
        </button>

        <button
          type="button"
          onClick={() => handleRoleSelect('COMPANY_ADMIN')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            selectedRole === 'COMPANY_ADMIN'
              ? 'bg-white text-indigo-600 shadow-sm border border-indigo-500/20'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Company HR Admin</span>
        </button>
      </div>

      {/* Role Hint Banner */}
      <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/60 flex items-start gap-3">
        <div className="p-1.5 bg-emerald-500 text-white rounded-lg shrink-0 mt-0.5">
          {selectedRole === 'SUPER_ADMIN' ? <ShieldCheck className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
        </div>
        <div>
          <p className="text-xs font-semibold text-emerald-900">
            {selectedRole === 'SUPER_ADMIN' ? 'Super Admin Access' : 'Company Admin Access'}
          </p>
          <p className="text-[11px] text-emerald-700 mt-0.5">
            {selectedRole === 'SUPER_ADMIN'
              ? 'Register new companies, manage subscriptions, and oversee nationwide Hazree network.'
              : 'Manage daily employee attendance logs, leaves, payroll & office geofencing.'}
          </p>
        </div>
      </div>

      {/* Main Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        <Input
          label="Work Email Address"
          type="email"
          value={email}

          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@hazree.com"
          icon={<Mail className="w-4 h-4" />}
          required
        />

        <div className="space-y-1.5">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            icon={<Lock className="w-4 h-4" />}
            required
          />
          <div className="flex justify-end pt-0.5">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-xs text-slate-500 hover:text-emerald-600 flex items-center gap-1 font-medium transition-colors"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showPassword ? 'Hide password' : 'Show password'}</span>
            </button>
          </div>
        </div>

        {/* Remember me & Forgot Password */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
            />
            <span className="text-xs font-medium text-slate-600">Remember this device</span>
          </label>
          <a href="#" className="text-xs font-semibold text-emerald-600 hover:underline">
            Forgot Password?
          </a>
        </div>

        <Button
          type="submit"
          variant={selectedRole === 'SUPER_ADMIN' ? 'primary' : 'secondary'}
          size="lg"
          className="w-full mt-2"
          isLoading={isLoading}
          icon={<ArrowRight className="w-4 h-4" />}
        >
          Sign In to Hazree Portal
        </Button>
      </form>
    </div>
  );
};
