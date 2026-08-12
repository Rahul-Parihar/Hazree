'use client';

import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { UserPlus, FileDown, CheckSquare, Settings } from 'lucide-react';

interface QuickActionsProps {
  onRegisterCompanyModal?: () => void;
  userRole?: string;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onRegisterCompanyModal, userRole }) => {
  return (
    <Card title="Quick Administrative Shortcuts" subtitle="Perform instant bulk actions & report exports">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {userRole === 'SUPER_ADMIN' ? (
          <button
            onClick={onRegisterCompanyModal}
            className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200/60 dark:border-emerald-800/40 text-left transition-all group"
          >
            <UserPlus className="w-5 h-5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
            <p className="font-bold text-xs text-emerald-950 dark:text-emerald-200 mt-2">Register Company</p>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">Onboard organization</p>
          </button>
        ) : (
          <button className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200/60 dark:border-emerald-800/40 text-left transition-all group">
            <UserPlus className="w-5 h-5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
            <p className="font-bold text-xs text-emerald-950 dark:text-emerald-200 mt-2">Add Employee</p>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">Create staff ID</p>
          </button>
        )}

        <button className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/60 dark:border-indigo-800/40 text-left transition-all group">
          <CheckSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
          <p className="font-bold text-xs text-indigo-950 dark:text-indigo-200 mt-2">Approve Leaves</p>
          <p className="text-[11px] text-indigo-700 dark:text-indigo-400 mt-0.5">3 pending requests</p>
        </button>

        <button className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/60 border border-sky-200/60 dark:border-sky-800/40 text-left transition-all group">
          <FileDown className="w-5 h-5 text-sky-600 dark:text-sky-400 group-hover:scale-110 transition-transform" />
          <p className="font-bold text-xs text-sky-950 dark:text-sky-200 mt-2">Export Payroll CSV</p>
          <p className="text-[11px] text-sky-700 dark:text-sky-400 mt-0.5">Download monthly report</p>
        </button>

        <button className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200/60 dark:border-purple-800/40 text-left transition-all group">
          <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
          <p className="font-bold text-xs text-purple-950 dark:text-purple-200 mt-2">Geofence Settings</p>
          <p className="text-[11px] text-purple-700 dark:text-purple-400 mt-0.5">Update GPS radius</p>
        </button>
      </div>
    </Card>
  );
};
