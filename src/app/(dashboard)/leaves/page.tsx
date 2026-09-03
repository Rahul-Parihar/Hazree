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
  Settings2,
  Pencil,
  Trash2,
  ShieldCheck,
  Palmtree,
  Stethoscope,
  Sparkles,
  Layers,
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../../redux/hooks';
import {
  fetchLeavesAsync,
  updateLeaveStatusAsync,
  createLeaveAsync,
  fetchLeaveTypesAsync,
  createLeaveTypeAsync,
  updateLeaveTypeAsync,
  deleteLeaveTypeAsync,
  clearLeaveError,
  clearLeaveSuccess,
} from '../../../redux/slices/leavesSlice';
import { LeaveRequest, LeaveStatus, LeaveType } from '../../../types';
import { CompanyLeaveType } from '../../../services/leavesService';
import { HazreeDataLoader } from '../../../components/ui/HazreeDataLoader';
import { canApproveLeaves, canManageStaff } from '../../../lib/permissionUtils';
import { cn } from '../../../lib/utils';

export default function LeavesPage() {
  const dispatch = useAppDispatch();
  const userRole = useAppSelector((state) => state.auth.userRole);
  const leaves = useAppSelector((state) => state.leaves.leaves);
  const leaveTypes = useAppSelector((state) => state.leaves.leaveTypes);
  const isLoading = useAppSelector((state) => state.leaves.isLoading);
  const isLoadingLeaveTypes = useAppSelector((state) => state.leaves.isLoadingLeaveTypes);
  const isUpdating = useAppSelector((state) => state.leaves.isUpdating);
  const isCreating = useAppSelector((state) => state.leaves.isCreating);
  const error = useAppSelector((state) => state.leaves.error);
  const successMessage = useAppSelector((state) => state.leaves.successMessage);
  const currentUser = useAppSelector((state) => state.auth.currentUser);

  const showApproveActions = canApproveLeaves(userRole);
  const showApplyAction = canManageStaff(userRole);

  // Main Page View (Requests vs Policies)
  const [activeMainTab, setActiveMainTab] = useState<'REQUESTS' | 'POLICIES'>('REQUESTS');
  const [activeTab, setActiveTab] = useState<string>('ALL');

  // Modal states
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isAddTypeModalOpen, setIsAddTypeModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<CompanyLeaveType | null>(null);

  // Form states for new leave request
  const [empName, setEmpName] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [leaveType, setLeaveType] = useState<string>('Casual');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');

  // Form states for Leave Type (Policy)
  const [typeName, setTypeName] = useState('');
  const [typeQuota, setTypeQuota] = useState(10);
  const [typeIsPaid, setTypeIsPaid] = useState(true);

  const companyIdNum = currentUser?.companyId
    ? Number(String(currentUser.companyId).replace('cmp_', ''))
    : undefined;

  useEffect(() => {
    dispatch(fetchLeavesAsync());
    dispatch(fetchLeaveTypesAsync(companyIdNum));
  }, [dispatch, companyIdNum]);

  // Set default selected leave type when leaveTypes load
  useEffect(() => {
    if (leaveTypes.length > 0 && !leaveTypes.some((lt) => lt.name === leaveType)) {
      setLeaveType(leaveTypes[0].name);
    }
  }, [leaveTypes, leaveType]);

  const handleRefresh = () => {
    dispatch(fetchLeavesAsync());
    dispatch(fetchLeaveTypesAsync(companyIdNum));
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

  const handleCreateLeaveTypeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typeName.trim()) return;

    const result = await dispatch(
      createLeaveTypeAsync({
        name: typeName.trim(),
        quota: Number(typeQuota) || 0,
        is_paid: typeIsPaid,
        company_id: companyIdNum,
      })
    );

    if (createLeaveTypeAsync.fulfilled.match(result)) {
      setIsAddTypeModalOpen(false);
      setTypeName('');
      setTypeQuota(10);
      setTypeIsPaid(true);
    }
  };

  const handleUpdateLeaveTypeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingType) return;

    const result = await dispatch(
      updateLeaveTypeAsync({
        id: editingType.id,
        payload: {
          name: typeName.trim() || editingType.name,
          quota: Number(typeQuota),
          is_paid: typeIsPaid,
        },
      })
    );

    if (updateLeaveTypeAsync.fulfilled.match(result)) {
      setEditingType(null);
      setTypeName('');
      setTypeQuota(10);
    }
  };

  const openEditModal = (lt: CompanyLeaveType) => {
    setEditingType(lt);
    setTypeName(lt.name);
    setTypeQuota(lt.quota);
    setTypeIsPaid(lt.is_paid);
  };

  const handleDeleteLeaveType = async (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}" leave type?`)) {
      await dispatch(deleteLeaveTypeAsync(id));
    }
  };

  const filteredLeaves = leaves.filter((leave) => {
    if (activeTab === 'ALL') return true;
    return leave.status.toUpperCase() === activeTab;
  });

  const pendingCount = leaves.filter((l) => l.status === 'Pending').length;
  const approvedCount = leaves.filter((l) => l.status === 'Approved').length;
  const rejectedCount = leaves.filter((l) => l.status === 'Rejected').length;

  const totalQuotaAllTypes = leaveTypes.reduce((acc, lt) => acc + (lt.quota || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-500" />
            <h2 className="text-xl font-heading font-extrabold text-slate-900">
              Leave Requests & Approvals
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure company leave balances & quotas, review time-off requests, and approve staff leaves
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading || isLoadingLeaveTypes}
            icon={<RefreshCw className={`w-4 h-4 ${isLoading || isLoadingLeaveTypes ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>

          {activeMainTab === 'POLICIES' ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setTypeName('');
                setTypeQuota(10);
                setTypeIsPaid(true);
                setIsAddTypeModalOpen(true);
              }}
              icon={<Plus className="w-4 h-4" />}
            >
              Add Leave Type
            </Button>
          ) : (
            showApplyAction && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsApplyModalOpen(true)}
                icon={<Plus className="w-4 h-4" />}
              >
                Apply Leave Request
              </Button>
            )
          )}
        </div>
      </div>

      {/* Main Mode Toggle: Requests vs Company Leave Policy */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
        <button
          onClick={() => setActiveMainTab('REQUESTS')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl font-heading text-sm font-semibold transition-all cursor-pointer',
            activeMainTab === 'REQUESTS'
              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/25'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          )}
        >
          <FileText className="w-4 h-4" />
          <span>Leave Applications</span>
          <span
            className={cn(
              'text-xs px-2 py-0.5 rounded-full font-bold tabular-nums',
              activeMainTab === 'REQUESTS' ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'
            )}
          >
            {leaves.length}
          </span>
        </button>

        <button
          onClick={() => setActiveMainTab('POLICIES')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl font-heading text-sm font-semibold transition-all cursor-pointer',
            activeMainTab === 'POLICIES'
              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/25'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          )}
        >
          <Settings2 className="w-4 h-4" />
          <span>Leave Types & Quotas</span>
          <span
            className={cn(
              'text-xs px-2 py-0.5 rounded-full font-bold tabular-nums',
              activeMainTab === 'POLICIES' ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'
            )}
          >
            {leaveTypes.length}
          </span>
        </button>
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
            className="text-emerald-700 hover:text-emerald-900 font-bold ml-4 cursor-pointer"
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
            className="text-red-700 hover:text-red-900 font-bold ml-4 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* VIEW 1: LEAVE REQUESTS */}
      {activeMainTab === 'REQUESTS' && (
        <div className="space-y-6">
          {/* Filter Tabs */}
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200/80 overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === 'ALL'
                  ? 'bg-white text-emerald-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All Requests ({leaves.length})
            </button>
            <button
              onClick={() => setActiveTab('PENDING')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === 'PENDING'
                  ? 'bg-white text-amber-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setActiveTab('APPROVED')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === 'APPROVED'
                  ? 'bg-white text-emerald-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Approved ({approvedCount})
            </button>
            <button
              onClick={() => setActiveTab('REJECTED')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === 'REJECTED'
                  ? 'bg-white text-red-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Rejected ({rejectedCount})
            </button>
          </div>

          {/* Leave Cards */}
          <div className="space-y-4">
            {isLoading && leaves.length === 0 ? (
              <HazreeDataLoader type="table-skeleton" rows={4} />
            ) : filteredLeaves.length === 0 ? (
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
                        className="w-12 h-12 rounded-2xl object-cover shrink-0 border border-slate-200 shadow-xs"
                      />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-heading font-bold text-slate-900 truncate">
                            {leave.employeeName}
                          </h4>
                          <span className="text-xs text-slate-500 font-medium">
                            ({leave.department})
                          </span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                            {leave.leaveType || 'Casual'}
                          </span>
                          {leave.is_paid === false ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                              Unpaid (Exceeded Quota)
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Paid
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-1">{leave.reason}</p>
                        {leave.adminNotes && (
                          <p className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded mt-1 border border-amber-200/60 w-fit">
                            {leave.adminNotes}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-3 text-slate-400 text-xs mt-1.5 font-medium">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {leave.startDate} to {leave.endDate}
                          </span>
                          <span>•</span>
                          <span className="font-semibold text-slate-700">
                            {leave.daysCount} {leave.daysCount === 1 ? 'day' : 'days'}
                          </span>
                          <span>•</span>
                          <span>Applied on {leave.appliedOn}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status & Approval Actions */}
                    <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                      <Badge
                        variant={
                          leave.status === 'Approved'
                            ? 'success'
                            : leave.status === 'Rejected'
                            ? 'danger'
                            : 'warning'
                        }
                      >
                        {leave.status}
                      </Badge>

                      {showApproveActions && leave.status === 'Pending' && (
                        <div className="flex items-center gap-1.5 ml-2">
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={isUpdating}
                            onClick={() => handleStatusChange(leave.id, 'Approved')}
                            icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            disabled={isUpdating}
                            onClick={() => handleStatusChange(leave.id, 'Rejected')}
                            icon={<XCircle className="w-3.5 h-3.5" />}
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
        </div>
      )}

      {/* VIEW 2: LEAVE TYPES & QUOTAS (COMPANY POLICY) */}
      {activeMainTab === 'POLICIES' && (
        <div className="space-y-6">
          {isLoadingLeaveTypes ? (
            <HazreeDataLoader type="table-skeleton" rows={3} />
          ) : leaveTypes.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <Layers className="w-7 h-7" />
              </div>
              <h4 className="font-heading font-bold text-base text-slate-900">
                No Leave Types Added Yet
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Aapne abhi tak koi leave type add nahi kiya hai. Naya leave type (jaise Sick, Casual, etc.) aur uska quota add karne ke liye niche button par click karein.
              </p>
              <div className="mt-5">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setTypeName('');
                    setTypeQuota(10);
                    setTypeIsPaid(true);
                    setIsAddTypeModalOpen(true);
                  }}
                  icon={<Plus className="w-4 h-4" />}
                >
                  Add Leave Type
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary Header */}
              <div className="flex items-center justify-between bg-white px-5 py-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
                  <span>Total Categories: <strong className="text-slate-900 font-bold ml-1">{leaveTypes.length}</strong></span>
                  <span>•</span>
                  <span>Total Quota Allocated: <strong className="text-emerald-700 font-bold ml-1">{totalQuotaAllTypes} Days</strong></span>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setTypeName('');
                    setTypeQuota(10);
                    setTypeIsPaid(true);
                    setIsAddTypeModalOpen(true);
                  }}
                  icon={<Plus className="w-4 h-4" />}
                >
                  Add Leave Type
                </Button>
              </div>

              {/* Leave Types List / Table View */}
              <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[650px]">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-heading font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-3.5 px-5">Leave Category</th>
                        <th className="py-3.5 px-4">Annual Quota</th>
                        <th className="py-3.5 px-4">Policy Type</th>
                        <th className="py-3.5 px-4">Customer Portal Preview</th>
                        <th className="py-3.5 px-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {leaveTypes.map((lt, idx) => (
                        <tr key={lt.id} className="hover:bg-slate-50/60 transition-colors">
                          {/* Name with Icon */}
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0 border border-emerald-200/60">
                                {lt.name.toLowerCase().includes('sick') ? (
                                  <Stethoscope className="w-4.5 h-4.5 text-rose-500" />
                                ) : lt.name.toLowerCase().includes('casual') ? (
                                  <Palmtree className="w-4.5 h-4.5 text-amber-500" />
                                ) : (
                                  <Layers className="w-4.5 h-4.5 text-emerald-600" />
                                )}
                              </div>
                              <div>
                                <p className="font-heading font-bold text-slate-900 text-sm">{lt.name}</p>
                                <span className="text-[10px] text-slate-400 font-mono">Category #{idx + 1}</span>
                              </div>
                            </div>
                          </td>

                          {/* Quota Days */}
                          <td className="py-4 px-4">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-heading font-bold text-sm border border-emerald-200/60 tabular-nums">
                              {lt.quota} Days / Year
                            </span>
                          </td>

                          {/* Paid / Unpaid */}
                          <td className="py-4 px-4">
                            <span
                              className={cn(
                                'text-[11px] uppercase font-bold px-2.5 py-1 rounded-md border inline-flex items-center gap-1.5',
                                lt.is_paid
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-slate-100 text-slate-600 border-slate-200'
                              )}
                            >
                              <span className={cn('w-1.5 h-1.5 rounded-full', lt.is_paid ? 'bg-emerald-500' : 'bg-slate-400')} />
                              {lt.is_paid ? 'Paid Leave' : 'Unpaid Leave'}
                            </span>
                          </td>

                          {/* Customer Portal Preview */}
                          <td className="py-4 px-4">
                            <code className="bg-slate-100 px-2.5 py-1 rounded-md text-slate-700 font-mono text-xs border border-slate-200 font-medium">
                              {lt.name} ({lt.quota})
                            </code>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditModal(lt)}
                                className="p-2 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                                title="Edit Quota"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteLeaveType(lt.id, lt.name)}
                                className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Delete Type"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: ADD LEAVE TYPE */}
      <Modal
        isOpen={isAddTypeModalOpen}
        onClose={() => setIsAddTypeModalOpen(false)}
        title="Add New Leave Type & Quota"
        subtitle="Create a leave category and define how many days employees receive"
      >
        <form onSubmit={handleCreateLeaveTypeSubmit} className="space-y-4">
          <Input
            label="Leave Type Name"
            placeholder="e.g. Sick, Casual, Earned, Maternity, monthly leaves"
            value={typeName}
            onChange={(e) => setTypeName(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Annual Days Allowed (Quota)
            </label>
            <input
              type="number"
              min="0"
              max="365"
              value={typeQuota}
              onChange={(e) => setTypeQuota(parseInt(e.target.value) || 0)}
              required
              className="w-full rounded-xl bg-white border border-slate-200 text-slate-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 tabular-nums"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Example: 10 Sick leaves ya 9 Casual leaves
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="is_paid_add"
              checked={typeIsPaid}
              onChange={(e) => setTypeIsPaid(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
            />
            <label htmlFor="is_paid_add" className="text-xs font-medium text-slate-700 cursor-pointer">
              Paid Leave (Salary deduction will not apply)
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsAddTypeModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Leave Type
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: EDIT LEAVE TYPE */}
      <Modal
        isOpen={!!editingType}
        onClose={() => setEditingType(null)}
        title={`Edit "${editingType?.name}" Leave Quota`}
        subtitle="Update the total allocated days or category name"
      >
        <form onSubmit={handleUpdateLeaveTypeSubmit} className="space-y-4">
          <Input
            label="Leave Type Name"
            value={typeName}
            onChange={(e) => setTypeName(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Total Days Quota
            </label>
            <input
              type="number"
              min="0"
              max="365"
              value={typeQuota}
              onChange={(e) => setTypeQuota(parseInt(e.target.value) || 0)}
              required
              className="w-full rounded-xl bg-white border border-slate-200 text-slate-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 tabular-nums"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="is_paid_edit"
              checked={typeIsPaid}
              onChange={(e) => setTypeIsPaid(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
            />
            <label htmlFor="is_paid_edit" className="text-xs font-medium text-slate-700 cursor-pointer">
              Paid Leave
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setEditingType(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Update Quota
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: APPLY LEAVE REQUEST */}
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
                onChange={(e) => setLeaveType(e.target.value)}
                className="w-full rounded-xl bg-white border border-slate-200 text-slate-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {leaveTypes.length > 0 ? (
                  leaveTypes.map((lt) => (
                    <option key={lt.id} value={lt.name}>
                      {lt.name} ({lt.quota} Days)
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    No leave types added yet. Please add one first.
                  </option>
                )}
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
