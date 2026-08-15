'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import {
  FileText,
  CheckCircle2,
  XCircle,
  Plus,
  RefreshCw,
  Calendar,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../../redux/hooks';
import {
  fetchLeavesAsync,
  updateLeaveStatusAsync,
  createLeaveAsync,
  clearLeaveError,
  clearLeaveSuccess,
} from '../../../redux/slices/leavesSlice';
import { LeaveRequest, LeaveStatus, LeaveType } from '../../../types';

export default function LeavesPage() {
  const dispatch = useAppDispatch();
  const leaves = useAppSelector((state) => state.leaves.leaves);
  const isLoading = useAppSelector((state) => state.leaves.isLoading);
  const isUpdating = useAppSelector((state) => state.leaves.isUpdating);
  const isCreating = useAppSelector((state) => state.leaves.isCreating);
  const error = useAppSelector((state) => state.leaves.error);
  const successMessage = useAppSelector((state) => state.leaves.successMessage);
  const currentUser = useAppSelector((state) => state.auth.currentUser);

  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // Form states for new leave request
  const [empName, setEmpName] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [leaveType, setLeaveType] = useState<LeaveType>('Casual');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');

  useEffect(() => {
    dispatch(fetchLeavesAsync());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchLeavesAsync());
  };

  const handleStatusChange = async (id: string, newStatus: LeaveStatus) => {
    await dispatch(updateLeaveStatusAsync({ id, status: newStatus }));
  };

  const handleCreateLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName || !reason) return;

    // Calculate days count
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const companyIdNum = currentUser?.companyId
      ? Number(String(currentUser.companyId).replace('cmp_', ''))
      : undefined;

    const result = await dispatch(
      createLeaveAsync({
        employee_name: empName,
        department: department,
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate,
        days_count: diffDays > 0 ? diffDays : 1,
        reason: reason,
        company_id: companyIdNum,
        applied_on: new Date().toISOString().split('T')[0],
      })
    );

    if (createLeaveAsync.fulfilled.match(result)) {
      setIsApplyModalOpen(false);
      setEmpName('');
      setReason('');
    }
  };

  const filteredLeaves = leaves.filter((leave) => {
    if (activeTab === 'ALL') return true;
    return leave.status.toUpperCase() === activeTab;
  });

  const pendingCount = leaves.filter((l) => l.status === 'Pending').length;
  const approvedCount = leaves.filter((l) => l.status === 'Approved').length;
  const rejectedCount = leaves.filter((l) => l.status === 'Rejected').length;

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-500" />
            <h2 className="text-xl font-extrabold text-slate-900">Leave Requests & Approvals</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review time-off requests, sick leave certificates, and vacation applications
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            icon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsApplyModalOpen(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Apply Leave Request
          </Button>
        </div>
      </div>

      {/* Success / Error Alerts */}
      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-emerald-800 text-xs font-semibold animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => dispatch(clearLeaveSuccess())}
            className="text-emerald-700 hover:text-emerald-900 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-red-800 text-xs font-semibold animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => dispatch(clearLeaveError())}
            className="text-red-700 hover:text-red-900 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200/80 overflow-x-auto w-full sm:w-auto">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
            activeTab === 'ALL'
              ? 'bg-white text-emerald-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          All Requests ({leaves.length})
        </button>
        <button
          onClick={() => setActiveTab('PENDING')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
            activeTab === 'PENDING'
              ? 'bg-white text-amber-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setActiveTab('APPROVED')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
            activeTab === 'APPROVED'
              ? 'bg-white text-emerald-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Approved ({approvedCount})
        </button>
        <button
          onClick={() => setActiveTab('REJECTED')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
            activeTab === 'REJECTED'
              ? 'bg-white text-red-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Rejected ({rejectedCount})
        </button>
      </div>

      {/* Leave Cards */}
      <div className="space-y-4">
        {filteredLeaves.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-500">
            <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-sm">No leave requests found in this category.</p>
          </div>
        ) : (
          filteredLeaves.map((leave) => (
            <Card key={leave.id} glass className="border border-slate-200/80">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                {/* Employee & Leave info */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 min-w-0">
                  <img
                    src={leave.employeeAvatar}
                    alt={leave.employeeName}
                    className="w-12 h-12 rounded-2xl object-cover shrink-0 border border-slate-200 shadow-sm"
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-slate-900 truncate">{leave.employeeName}</h4>
                      <span className="text-xs text-slate-500 font-medium">({leave.department})</span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {leave.leaveType || 'Casual'} Leave
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{leave.reason}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-2 font-mono">
                      <span>
                        Duration: <strong>{leave.startDate}</strong> to <strong>{leave.endDate}</strong> ({leave.daysCount} {leave.daysCount === 1 ? 'day' : 'days'})
                      </span>
                      <span>Applied on: {leave.appliedOn}</span>
                    </div>
                  </div>
                </div>

                {/* Status & Approve / Reject Actions */}
                <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <Badge variant={leave.status === 'Approved' ? 'present' : leave.status === 'Pending' ? 'pending' : 'absent'}>
                    {leave.status}
                  </Badge>

                  {leave.status === 'Pending' && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        icon={<CheckCircle2 className="w-4 h-4" />}
                        disabled={isUpdating}
                        onClick={() => handleStatusChange(leave.id, 'Approved')}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        icon={<XCircle className="w-4 h-4" />}
                        disabled={isUpdating}
                        onClick={() => handleStatusChange(leave.id, 'Rejected')}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Apply Leave Request Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Submit Employee Leave Application"
        subtitle="Apply time-off on behalf of an employee"
      >
        <form onSubmit={handleCreateLeaveSubmit} className="space-y-4">
          <Input
            label="Employee Full Name"
            placeholder="e.g. Sneha Patel"
            value={empName}
            onChange={(e) => setEmpName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full rounded-xl bg-white border border-slate-200 text-slate-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Engineering">Engineering</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Sales & Marketing">Sales & Marketing</option>
                <option value="Design & UI">Design & UI</option>
                <option value="Operations">Operations</option>
                <option value="Finance & Accounts">Finance & Accounts</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Leave Type
              </label>
              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                className="w-full rounded-xl bg-white border border-slate-200 text-slate-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Casual">Casual Leave</option>
                <option value="Sick">Sick / Medical Leave</option>
                <option value="Paid">Paid Vacation</option>
                <option value="Unpaid">Unpaid Leave</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
            <Input
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Reason / Justification
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Attending family function in Ahmedabad..."
              rows={3}
              required
              className="w-full rounded-xl bg-white border border-slate-200 text-slate-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsApplyModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isCreating}>
              {isCreating ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
