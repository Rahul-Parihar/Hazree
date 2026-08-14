'use client';

import React, { useState } from 'react';
import { ShieldAlert, X, AlertTriangle } from 'lucide-react';
import { Company } from '../../types';
import { Button } from '../ui/Button';

interface SuspendCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company | null;
  onConfirm: (companyId: string, reason: string, notes: string) => Promise<void> | void;
  isLoading?: boolean;
}

const REASONS = [
  'Terms of Service / Policy Violation',
  'Security & Fraud Alert',
  'Client Requested Pause',
  'Inactive / No Attendance Activity',
  'Other Reason',
];

export const SuspendCompanyModal: React.FC<SuspendCompanyModalProps> = ({
  isOpen,
  onClose,
  company,
  onConfirm,
  isLoading = false,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>(REASONS[0]);
  const [customReason, setCustomReason] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !company) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let reason = selectedReason;

    if (selectedReason === 'Other Reason') {
      if (!customReason.trim()) {
        setError('Please enter a reason');
        return;
      }
      reason = customReason.trim();
    }

    setError(null);
    await onConfirm(company.id, reason, '');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm transition-opacity"
        onClick={!isLoading ? onClose : undefined}
      />

      {/* Compact Dialog */}
      <div className="relative w-full max-w-sm bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-10 animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Suspend Company</h3>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Are you sure you want to suspend <strong className="text-slate-900">{company.name}</strong>?
          </p>

          {/* Reason Dropdown */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Suspension Reason
            </label>
            <select
              value={selectedReason}
              onChange={(e) => {
                setSelectedReason(e.target.value);
                setError(null);
              }}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
            >
              {REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Reason Field */}
          {selectedReason === 'Other Reason' && (
            <div className="space-y-1 animate-fade-in">
              <input
                type="text"
                value={customReason}
                onChange={(e) => {
                  setCustomReason(e.target.value);
                  setError(null);
                }}
                placeholder="Enter specific reason..."
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
                autoFocus
              />
            </div>
          )}

          {/* Validation Error */}
          {error && (
            <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              {error}
            </p>
          )}

          {/* Warning text */}
          <p className="text-[11px] text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200/70">
            This will temporarily pause login & biometric punch sync for this organization.
          </p>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="sm"
              isLoading={isLoading}
            >
              Suspend
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
