'use client';

import React, { useState } from 'react';
import { Search, Filter, MoreVertical, Building2, MapPin, Mail, Phone, Users, Plus } from 'lucide-react';
import { Company } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface CompanyTableProps {
  companies: Company[];
  onOpenRegisterModal: () => void;
  onStatusChange: (id: string, newStatus: Company['status']) => void;
}

export const CompanyTable: React.FC<CompanyTableProps> = ({
  companies,
  onOpenRegisterModal,
  onStatusChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const filteredCompanies = companies.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.adminName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.adminEmail.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === 'ALL' || c.status.toUpperCase() === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Search & Filter */}
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search companies, admin name, or HAZ code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </div>

        {/* Register Button */}
        <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={onOpenRegisterModal}>
          Register New Company
        </Button>
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
                      {/* Company Name & Code */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
                            {c.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 leading-snug">{c.name}</p>
                            <p className="text-xs text-slate-500 font-mono mt-0.5">{c.code}</p>
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
                        <div className="flex items-center justify-end gap-2">
                          {c.status === 'Active' ? (
                            <button
                              onClick={() => onStatusChange(c.id, 'Suspended')}
                              className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              Suspend
                            </button>
                          ) : (
                            <button
                              onClick={() => onStatusChange(c.id, 'Active')}
                              className="px-2.5 py-1 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            >
                              Activate
                            </button>
                          )}
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
    </div>
  );
};
