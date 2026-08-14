'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import {
  Users,
  Mail,
  Phone,
  Search,
  Building2,
  Filter,
  Briefcase,
  RotateCcw,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../../redux/hooks';
import { fetchCompaniesAsync } from '../../../redux/slices/companiesSlice';

export default function EmployeesPage() {
  const dispatch = useAppDispatch();
  const employees = useAppSelector((state) => state.employees.employees);
  const companies = useAppSelector((state) => state.companies.companies);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('ALL');

  useEffect(() => {
    dispatch(fetchCompaniesAsync());
  }, [dispatch]);

  // Extract distinct companies from data
  const distinctCompanies = Array.from(
    new Set([
      ...companies.map((c) => c.name),
      ...employees.map((e) => e.companyName).filter(Boolean),
    ])
  );

  // Filter Pipeline
  const filteredEmployees = employees.filter((e) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      query === '' ||
      e.name.toLowerCase().includes(query) ||
      e.email.toLowerCase().includes(query) ||
      (e.role && e.role.toLowerCase().includes(query)) ||
      (e.department && e.department.toLowerCase().includes(query)) ||
      (e.companyName && e.companyName.toLowerCase().includes(query)) ||
      (e.phone && e.phone.includes(query));

    const matchesCompany =
      selectedCompany === 'ALL' ||
      (e.companyName && e.companyName.toLowerCase() === selectedCompany.toLowerCase());

    return matchesSearch && matchesCompany;
  });

  const hasActiveFilters = searchQuery.trim() !== '' || selectedCompany !== 'ALL';

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCompany('ALL');
  };

  const totalEmployees = employees.length;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-sm">
              <Users className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">Employee Directory List</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Super Admin View • Cross-organization staff roster, assigned roles, and official contact directory
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            Managed by Organization Admins
          </span>
        </div>
      </div>

      {/* Multi-Tenant Filter Controls Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, department, role, organization..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2 bg-slate-50/70 border border-slate-200/90 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Controls Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Company Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50/80 px-2.5 py-1.5 rounded-xl border border-slate-200">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer max-w-[170px] truncate"
            >
              <option value="ALL">All Organizations</option>
              {distinctCompanies.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters */}
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
        </div>
      </div>

      {/* Filtered Count indicator */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong>{filteredEmployees.length}</strong> of <strong>{totalEmployees}</strong> staff members
        </span>
      </div>

      {/* Employee Professional Table List View */}
      {filteredEmployees.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h4 className="text-base font-extrabold text-slate-900">No Employees Found</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No employee records match the active search and filter criteria. Try resetting your filters.
          </p>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={handleResetFilters}>
              Reset Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Employee Member</th>
                  <th className="py-3.5 px-4">Organization</th>
                  <th className="py-3.5 px-4">Role & Department</th>
                  <th className="py-3.5 px-4">Contact Phone</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Enrolled Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredEmployees.map((emp) => (
                  <tr
                    key={emp.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Employee Profile */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={emp.avatar}
                          alt={emp.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-sm shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900 text-sm group-hover:text-emerald-600 transition-colors">
                            {emp.name}
                          </p>
                          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mt-0.5">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{emp.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Organization */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span className="font-semibold text-slate-900">
                          {emp.companyName || 'Hazree Organization'}
                        </span>
                      </div>
                    </td>

                    {/* Role & Department */}
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-semibold text-slate-800">{emp.role}</p>
                        <span className="inline-block text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mt-0.5">
                          {emp.department}
                        </span>
                      </div>
                    </td>

                    {/* Contact Phone */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="font-mono text-[11px]">{emp.phone || '+91 98000 00000'}</span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          emp.status === 'Active'
                            ? 'active'
                            : emp.status === 'On Leave'
                            ? 'pending'
                            : 'neutral'
                        }
                      >
                        {emp.status}
                      </Badge>
                    </td>

                    {/* Enrolled Date */}
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{emp.joinDate || '14/08/2026'}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
