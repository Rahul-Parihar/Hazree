'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CompanyTable } from '../../../components/super-admin/CompanyTable';
import { RegisterCompanyModal } from '../../../components/super-admin/RegisterCompanyModal';
import { PlatformStats } from '../../../components/super-admin/PlatformStats';
import { Company } from '../../../types';
import { Building2, Plus, RefreshCw, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { useAppSelector, useAppDispatch } from '../../../redux/hooks';
import {
  fetchCompaniesAsync,
  updateCompanyStatus,
  clearCompanySuccess,
  clearCompanyError,
} from '../../../redux/slices/companiesSlice';

export default function CompaniesPage() {
  const dispatch = useAppDispatch();
  const companies = useAppSelector((state) => state.companies.companies);
  const isLoading = useAppSelector((state) => state.companies.isLoading);
  const successMessage = useAppSelector((state) => state.companies.successMessage);
  const errorMessage = useAppSelector((state) => state.companies.error);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchCompaniesAsync());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchCompaniesAsync());
  };

  const handleCompanyStatusChange = (id: string, newStatus: Company['status']) => {
    dispatch(updateCompanyStatus({ id, status: newStatus }));
  };

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
          <button
            onClick={() => dispatch(clearCompanySuccess())}
            className="text-xs text-emerald-700 hover:text-emerald-900 font-bold ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between shadow-sm animate-shake">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => dispatch(clearCompanyError())}
            className="text-xs text-rose-700 hover:text-rose-900 font-bold ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-500" />
            <h2 className="text-xl font-extrabold text-slate-900">Registered Organizations</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Super Admin multi-tenant company onboarding, PostgreSQL syncing, subscription management, and quota limits.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={handleRefresh}
            disabled={isLoading}
          >
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsRegisterModalOpen(true)}
          >
            Quick Register
          </Button>

          <Link href="/companies/register">
            <Button
              variant="primary"
              size="sm"
              icon={<Sparkles className="w-4 h-4" />}
            >
              Register New Organization
            </Button>
          </Link>
        </div>
      </div>

      {/* Platform Stats */}
      <PlatformStats totalCompanies={companies.length} />

      {/* Company Table */}
      <CompanyTable
        companies={companies}
        onStatusChange={handleCompanyStatusChange}
      />

      <RegisterCompanyModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
      />
    </div>
  );
}


