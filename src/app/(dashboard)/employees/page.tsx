'use client';

import React, { useState } from 'react';
import { mockEmployees } from '../../../lib/mockData';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Users, UserPlus, Mail, Phone, Search, Building } from 'lucide-react';

export default function EmployeesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEmployees = mockEmployees.filter(
    (e) =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-500" />
            <h2 className="text-xl font-extrabold text-slate-900">Employee Directory</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage staff profiles, department assignments, and authentication credentials
          </p>
        </div>

        <Button variant="primary" icon={<UserPlus className="w-4 h-4" />}>
          Add New Employee
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Search by employee name, email, department..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmployees.map((emp) => (
          <Card key={emp.id} glass className="border border-slate-200/80">
            <div className="flex items-start gap-4">
              <img
                src={emp.avatar}
                alt={emp.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500/20"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 truncate">{emp.name}</h4>
                  <Badge variant={emp.status === 'Active' ? 'active' : 'pending'}>{emp.status}</Badge>
                </div>
                <p className="text-xs font-semibold text-emerald-600 mt-0.5">{emp.role}</p>
                <p className="text-xs text-slate-500 mt-0.5">{emp.department}</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{emp.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{emp.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>{emp.companyName}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
