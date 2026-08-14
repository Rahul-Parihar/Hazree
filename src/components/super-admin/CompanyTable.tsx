'use client';

import React, { useState } from 'react';
import { Search, MapPin, Mail, Trash2, Filter, ArrowUpDown, RotateCcw, X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Company } from '../../types';
import { Badge } from '../ui/Badge';
import { useAppDispatch } from '../../redux/hooks';
import { deleteCompanyAsync, updateCompanyStatusAsync } from '../../redux/slices/companiesSlice';
import { SuspendCompanyModal } from './SuspendCompanyModal';

interface CompanyTableProps {
  companies: Company[];
  onStatusChange?: (id: string, newStatus: Company['status']) => void;
}

export const CompanyTable: React.FC<CompanyTableProps> = ({
  companies,
  onStatusChange,
}) => {
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedPlan, setSelectedPlan] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('NEWEST');
  const [suspendTargetCompany, setSuspendTargetCompany] = useState<Company | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const handleDelete = (company: Company) => {
    if (window.confirm(`Are you sure you want to delete "${company.name}" from the database?`)) {
      dispatch(deleteCompanyAsync(company.id));
    }
  };

  const handleOpenSuspendModal = (company: Company) => {
    setSuspendTargetCompany(company);
  };

  const handleConfirmSuspend = async (companyId: string, reason: string, notes: string) => {
    setIsUpdatingStatus(true);
    try {
      await dispatch(
        updateCompanyStatusAsync({
          id: companyId,
          status: 'Suspended',
          reason,
          notes,
        })
      );
      if (onStatusChange) {
        onStatusChange(companyId, 'Suspended');
      }
    } finally {
      setIsUpdatingStatus(false);
      setSuspendTargetCompany(null);
    }
  };

  const handleActivateCompany = async (company: Company) => {
    setIsUpdatingStatus(true);
    try {
      await dispatch(
        updateCompanyStatusAsync({
          id: company.id,
          status: 'Active',
        })
      );
      if (onStatusChange) {
        onStatusChange(company.id, 'Active');
      }
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedStatus('ALL');
    setSelectedPlan('ALL');
    setSortBy('NEWEST');
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedStatus !== 'ALL' ||
    selectedPlan !== 'ALL' ||
    sortBy !== 'NEWEST';

  const uniquePlans = Array.from(
    new Set(['Trial', 'Growth', 'Enterprise', ...companies.map((c) => c.plan).filter(Boolean)])
  );

  // Filter and Sort Pipeline
  const filteredCompanies = companies
    .filter((company) => {
      // 1. Search Query Filter
      const matchesSearch =
        searchQuery.trim() === '' ||
        company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.adminEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.adminName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.location.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Status Filter
      const matchesStatus =
        selectedStatus === 'ALL' ||
        company.status.toUpperCase() === selectedStatus.toUpperCase();

      // 3. Plan Filter
      const matchesPlan =
        selectedPlan === 'ALL' ||
        company.plan.toUpperCase() === selectedPlan.toUpperCase();

      return matchesSearch && matchesStatus && matchesPlan;
    })
    .sort((a, b) => {
      if (sortBy === 'NAME_ASC') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'NAME_DESC') {
        return b.name.localeCompare(a.name);
      }
      if (sortBy === 'STAFF_DESC') {
        return b.employeeCount - a.employeeCount;
      }
      if (sortBy === 'OLDEST') {
        return (a.createdAt || '').localeCompare(b.createdAt || '');
      }
      // Default: NEWEST
      return (b.createdAt || '').localeCompare(a.createdAt || '');
    });

  return (
    <div className="space-y-4">
      {/* Header Search & Filter Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by organization name, admin, email, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2 bg-slate-50/70 border border-slate-200/90 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Controls Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50/80 px-2.5 py-1.5 rounded-xl border border-slate-200">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>

          {/* Plan Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50/80 px-2.5 py-1.5 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Plan:</span>
            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Plans</option>
              {uniquePlans.map((p) => (
                <option key={p} value={p.toUpperCase()}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50/80 px-2.5 py-1.5 rounded-xl border border-slate-200">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="NEWEST">Newest First</option>
              <option value="OLDEST">Oldest First</option>
              <option value="NAME_ASC">Name (A to Z)</option>
              <option value="NAME_DESC">Name (Z to A)</option>
              <option value="STAFF_DESC">Most Staff</option>
            </select>
          </div>

          {/* Clear / Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              title="Reset all filters"
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          {/* Results Count Tag */}
          <div className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1.5 rounded-xl">
            {filteredCompanies.length} of {companies.length}
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
              <tr>
                <th className="py-3.5 px-4">Company</th>
                <th className="py-3.5 px-4">Primary Admin</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Plan & Capacity</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-500">
                    No matching companies found.
                  </td>
                </tr>
              ) : (
                filteredCompanies.map((c) => {
                  const capacityPercent = Math.min(Math.round((c.employeeCount / c.maxEmployees) * 100), 100);

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Company Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
                            {c.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 leading-snug">{c.name}</p>
                            <p className="text-xs text-slate-500 mt-0.5">Joined {c.createdAt}</p>
                          </div>
                        </div>
                      </td>

                      {/* Admin Contact */}
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-medium text-slate-800">{c.adminName}</p>
                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" />
                              {c.adminEmail}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          {c.location}
                        </span>
                      </td>

                      {/* Plan & Capacity */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <Badge
                            variant={
                              c.plan === 'Enterprise' ? 'enterprise' : c.plan === 'Growth' ? 'growth' : 'trial'
                            }
                            dot={false}
                          >
                            {c.plan}
                          </Badge>
                          <div className="w-32">
                            <div className="flex justify-between text-[11px] text-slate-500">
                              <span>{c.employeeCount} staff</span>
                              <span>Limit: {c.maxEmployees}</span>
                            </div>
                            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                              <div
                                className="bg-emerald-500 h-full rounded-full transition-all"
                                style={{ width: `${capacityPercent}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            c.status === 'Active' ? 'active' : c.status === 'Pending' ? 'pending' : 'suspended'
                          }
                        >
                          {c.status}
                        </Badge>
                      </td>

                      {/* Quick Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {c.status === 'Active' ? (
                            <button
                              onClick={() => handleOpenSuspendModal(c)}
                              disabled={isUpdatingStatus}
                              className="px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 hover:text-amber-900 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                            >
                              <ShieldAlert className="w-3.5 h-3.5" />
                              Suspend
                            </button>
                          ) : (
                            <button
                              onClick={() => handleActivateCompany(c)}
                              disabled={isUpdatingStatus}
                              className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-900 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Activate
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(c)}
                            title="Delete Company"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Suspend Confirmation & Reason Modal */}
      <SuspendCompanyModal
        isOpen={!!suspendTargetCompany}
        company={suspendTargetCompany}
        onClose={() => setSuspendTargetCompany(null)}
        onConfirm={handleConfirmSuspend}
        isLoading={isUpdatingStatus}
      />
    </div>
  );
};
