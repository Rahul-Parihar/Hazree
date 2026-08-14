'use client';

import React, { useState } from 'react';
import { Search, MapPin, Smartphone, Plus, CheckCircle, Clock } from 'lucide-react';
import { AttendanceRecord } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';

interface RecentAttendanceTableProps {
  records: AttendanceRecord[];
  onAddRecord?: (record: AttendanceRecord) => void;
}

export const RecentAttendanceTable: React.FC<RecentAttendanceTableProps> = ({
  records,
  onAddRecord,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('ALL');

  // Manual Hazree Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [empName, setEmpName] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [status, setStatus] = useState<AttendanceRecord['status']>('Present');
  const [checkIn, setCheckIn] = useState('09:00 AM');

  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab = activeTab === 'ALL' || r.status.toUpperCase().replace(/\s+/g, '') === activeTab;

    return matchesSearch && matchesTab;
  });

  const handleManualPunchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName) return;

    const newRecord: AttendanceRecord = {
      id: `att_${Date.now()}`,
      employeeId: `emp_${Math.floor(Math.random() * 100)}`,
      employeeName: empName,
      employeeAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      companyId: 'cmp_101',
      department: department,
      date: new Date().toISOString().split('T')[0],
      checkInTime: checkIn,
      checkOutTime: '--',
      status: status,
      workHours: 'Active',
      location: 'Manual HR Override (BKC Office)',
      device: 'Admin Portal Web Console',
    };

    if (onAddRecord) {
      onAddRecord(newRecord);
    }
    setIsModalOpen(false);
    setEmpName('');
  };

  return (
    <div className="space-y-4">
      {/* Table Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'PRESENT', 'LATE', 'ABSENT', 'HALFDAY'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                activeTab === tab
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab === 'HALFDAY' ? 'Half Day' : tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Search & Manual Punch Action */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search employee, department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setIsModalOpen(true)}>
            Mark Hazree
          </Button>
        </div>
      </div>

      {/* Attendance Logs Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[650px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
              <tr>
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Check In</th>
                <th className="py-3.5 px-4">Check Out</th>
                <th className="py-3.5 px-4">Location & Device</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-500">
                    No matching attendance logs for today.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Employee Profile */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={r.employeeAvatar}
                          alt={r.employeeName}
                          className="w-9 h-9 rounded-xl object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900 leading-snug">{r.employeeName}</p>
                          <p className="text-xs text-slate-500 font-mono">ID: {r.employeeId}</p>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="py-3.5 px-4 text-xs font-semibold text-slate-700">
                      {r.department}
                    </td>

                    {/* Check In */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200/50">
                        {r.checkInTime}
                      </span>
                    </td>

                    {/* Check Out */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-xs text-slate-600">
                        {r.checkOutTime}
                      </span>
                    </td>

                    {/* Location & Device */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5 text-xs text-slate-600">
                        <span className="flex items-center gap-1 font-medium">
                          <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                          {r.location}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Smartphone className="w-3 h-3 shrink-0" />
                          {r.device}
                        </span>
                      </div>
                    </td>

                    {/* Status Pill */}
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          r.status === 'Present'
                            ? 'present'
                            : r.status === 'Late'
                            ? 'late'
                            : r.status === 'Absent'
                            ? 'absent'
                            : 'halfday'
                        }
                      >
                        {r.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Attendance Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Mark Manual Attendance (Hazree)"
        subtitle="Override attendance entry for an employee"
      >
        <form onSubmit={handleManualPunchSubmit} className="space-y-4">
          <Input
            label="Employee Full Name"
            placeholder="e.g. Rahul Sharma"
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
                className="w-full rounded-xl bg-white/80 border border-slate-200 text-slate-900 px-4 py-2.5 text-sm"
              >
                <option value="Engineering">Engineering</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Sales & Marketing">Sales & Marketing</option>
                <option value="Design & UI">Design & UI</option>
                <option value="Operations">Operations</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AttendanceRecord['status'])}
                className="w-full rounded-xl bg-white/80 border border-slate-200 text-slate-900 px-4 py-2.5 text-sm"
              >
                <option value="Present">Present (On Time)</option>
                <option value="Late">Late Arrival</option>
                <option value="Half Day">Half Day Shift</option>
                <option value="Absent">Unexcused Absent</option>
              </select>
            </div>
          </div>

          <Input
            label="Check-in Time"
            placeholder="09:00 AM"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            required
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Confirm Punch
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
