'use client';

import React, { useState, useEffect } from 'react';
import { CompanyTable } from '../../../components/super-admin/CompanyTable';
import { RegisterCompanyModal } from '../../../components/super-admin/RegisterCompanyModal';
import { PlatformStats } from '../../../components/super-admin/PlatformStats';
import { Company } from '../../../types';
import { Building2, Plus } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { useAppSelector, useAppDispatch } from '../../../redux/hooks';
import {
  fetchCompaniesAsync,
  createCompanyAsync,
  updateCompanyStatus,
} from '../../../redux/slices/companiesSlice';

export default function CompaniesPage() {
  const dispatch = useAppDispatch();
  const companies = useAppSelector((state) => state.companies.companies);
  const isLoading = useAppSelector((state) => state.companies.isLoading);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchCompaniesAsync());
  }, [dispatch]);

  const handleRegisterCompanySuccess = (newCompany: Company) => {
    dispatch(createCompanyAsync(newCompany));
  };

  const handleCompanyStatusChange = (id: string, newStatus: Company['status']) => {
    dispatch(updateCompanyStatus({ id, status: newStatus }));
  };


  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-500" />
            <h2 className="text-xl font-extrabold text-slate-900">Registered Organizations</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Super Admin multi-tenant company onboarding, subscription management, and quota limits.
          </p>
        </div>

        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsRegisterModalOpen(true)}
        >
          Register New Company
        </Button>
      </div>

      {/* Platform Stats */}
      <PlatformStats totalCompanies={companies.length} />

      {/* Company Table */}
      <CompanyTable
        companies={companies}
        onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
        onStatusChange={handleCompanyStatusChange}
      />

      <RegisterCompanyModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onRegisterSuccess={handleRegisterCompanySuccess}
      />
    </div>
  );
}

