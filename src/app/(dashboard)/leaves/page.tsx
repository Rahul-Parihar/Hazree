'use client';

import React from 'react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { FileText, CheckCircle2, XCircle } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../../redux/hooks';
import { updateLeaveStatus } from '../../../redux/slices/leavesSlice';
import { LeaveRequest } from '../../../types';

export default function LeavesPage() {
  const dispatch = useAppDispatch();
  const leaves = useAppSelector((state) => state.leaves.leaves);

  const handleStatusChange = (id: string, newStatus: LeaveRequest['status']) => {
    dispatch(updateLeaveStatus({ id, status: newStatus }));
  };

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Title */}
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
      </div>

      {/* Leave Cards */}
      <div className="space-y-4">
        {leaves.map((leave) => (
          <Card key={leave.id} glass className="border border-slate-200/80">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              {/* Employee & Leave info */}
              <div className="flex items-center gap-4">
                <img
                  src={leave.employeeAvatar}
                  alt={leave.employeeName}
                  className="w-12 h-12 rounded-2xl object-cover"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900">{leave.employeeName}</h4>
                    <span className="text-xs text-slate-500 font-medium">({leave.department})</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{leave.reason}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-2 font-mono">
                    <span>
                      Duration: <strong>{leave.startDate}</strong> to <strong>{leave.endDate}</strong> ({leave.daysCount} days)
                    </span>
                    <span>Applied on: {leave.appliedOn}</span>
                  </div>
                </div>
              </div>

              {/* Status & Approve / Reject Actions */}
              <div className="flex items-center gap-3 self-end md:self-center">
                <Badge variant={leave.status === 'Approved' ? 'present' : leave.status === 'Pending' ? 'pending' : 'absent'}>
                  {leave.status}
                </Badge>

                {leave.status === 'Pending' && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<CheckCircle2 className="w-4 h-4" />}
                      onClick={() => handleStatusChange(leave.id, 'Approved')}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      icon={<XCircle className="w-4 h-4" />}
                      onClick={() => handleStatusChange(leave.id, 'Rejected')}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

