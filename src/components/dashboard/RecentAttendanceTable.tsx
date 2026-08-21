'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  MapPin,
  Smartphone,
  Plus,
  CheckCircle,
  Clock,
  Calendar,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  LogOut,
  LogIn,
  Filter,
  Eye,
} from 'lucide-react';
import { AttendanceRecord } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { MarkAttendanceModal } from '../company-admin/MarkAttendanceModal';
import { EmployeeAttendanceDrawer } from '../attendance/EmployeeAttendanceDrawer';
import { useAppSelector } from '../../redux/hooks';

interface RecentAttendanceTableProps {
  records: AttendanceRecord[];
  onAddRecord?: (record: AttendanceRecord) => void;
}

export const RecentAttendanceTable: React.FC<RecentAttendanceTableProps> = ({
  records,
  onAddRecord,
}) => {
  const userRole = useAppSelector((state) => state.auth.userRole);
  const isCompanyAdmin = userRole === 'COMPANY_ADMIN';
  const employees = useAppSelector((state) => state.employees.employees);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr); // Defaults to today
  const [filterMode, setFilterMode] = useState<'TODAY' | 'ALL' | 'CUSTOM'>('TODAY');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Drawer Sidebar state for Employee by Employee details
  const [selectedRecordForDrawer, setSelectedRecordForDrawer] = useState<AttendanceRecord | null>(null);

  // Find corresponding employee object for the drawer
  const targetEmployeeForDrawer = useMemo(() => {
    if (!selectedRecordForDrawer) return null;
    return (
      employees.find(
        (e) =>
          e.id === selectedRecordForDrawer.employeeId ||
          e.id === `emp_${selectedRecordForDrawer.employeeId}` ||
          String(e.id).replace('emp_', '') === String(selectedRecordForDrawer.employeeId).replace('emp_', '') ||
          e.name.toLowerCase() === selectedRecordForDrawer.employeeName.toLowerCase()
      ) || null
    );
  }, [employees, selectedRecordForDrawer]);

  // Filter records based on Date, Tab & Search Query
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // 1. Date Filter
      if (filterMode === 'TODAY') {
        if (r.date && r.date !== todayStr) return false;
      } else if (filterMode === 'CUSTOM' && selectedDate) {
        if (r.date && r.date !== selectedDate) return false;
      }

      // 2. Search Query Filter
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        r.employeeName.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        (r.employeeId && r.employeeId.toLowerCase().includes(q));

      // 3. Tab Filter (Status / Session State)
      const checkIn = r.checkInTime || r.checkIn || '';
      const checkOut = r.checkOutTime || r.checkOut || '';
      const hasClockIn = checkIn !== '' && checkIn !== '--';
      const hasClockOut = checkOut !== '' && checkOut !== '--';

      let matchesTab = true;
      if (activeTab === 'ALL') {
        matchesTab = true;
      } else if (activeTab === 'ACTIVE_IN') {
        // Currently Clocked In, Pending Clock Out
        matchesTab = hasClockIn && !hasClockOut;
      } else if (activeTab === 'CLOCKED_OUT') {
        // Clocked Out / Completed Session
        matchesTab = hasClockOut;
      } else if (activeTab === 'PRESENT') {
        matchesTab = r.status === 'Present';
      } else if (activeTab === 'LATE') {
        matchesTab = r.status === 'Late';
      } else if (activeTab === 'ABSENT') {
        matchesTab = r.status === 'Absent';
      } else if (activeTab === 'HALFDAY') {
        matchesTab = r.status === 'Half Day';
      }

      return matchesSearch && matchesTab;
    });
  }, [records, filterMode, selectedDate, todayStr, searchQuery, activeTab]);

  // Compute Today's Clock-in Metrics
  const metrics = useMemo(() => {
    const todayLogs = records.filter((r) => !r.date || r.date === todayStr);
    const totalClockedIn = todayLogs.filter((r) => {
      const cin = r.checkInTime || r.checkIn || '';
      return cin !== '' && cin !== '--';
    }).length;

    const inSessionActive = todayLogs.filter((r) => {
      const cin = r.checkInTime || r.checkIn || '';
      const cout = r.checkOutTime || r.checkOut || '';
      return cin !== '' && cin !== '--' && (cout === '' || cout === '--');
    }).length;

    const completedClockOut = todayLogs.filter((r) => {
      const cout = r.checkOutTime || r.checkOut || '';
      return cout !== '' && cout !== '--';
    }).length;

    const lateCount = todayLogs.filter((r) => r.status === 'Late').length;

    return {
      totalToday: todayLogs.length,
      totalClockedIn,
      inSessionActive,
      completedClockOut,
      lateCount,
    };
  }, [records, todayStr]);

  return (
    <div className="space-y-5">
      {/* Date Filter & Quick Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Today Clock-Ins */}
        <div
          onClick={() => {
            setFilterMode('TODAY');
            setActiveTab('ALL');
          }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            filterMode === 'TODAY' && activeTab === 'ALL'
              ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
              : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Today Clock-Ins</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <LogIn className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{metrics.totalClockedIn}</span>
            <span className="text-xs font-semibold text-emerald-600">Punched In</span>
          </div>
        </div>

        {/* Active In-Session (Clock-Out Pending) */}
        <div
          onClick={() => {
            setFilterMode('TODAY');
            setActiveTab('ACTIVE_IN');
          }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'ACTIVE_IN'
              ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-500/20 shadow-xs'
              : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active In Session</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{metrics.inSessionActive}</span>
            <span className="text-xs font-semibold text-amber-600">In Office</span>
          </div>
        </div>

        {/* Shift Completed (Clocked Out) */}
        <div
          onClick={() => {
            setFilterMode('TODAY');
            setActiveTab('CLOCKED_OUT');
          }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'CLOCKED_OUT'
              ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
              : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Clocked Out</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <LogOut className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{metrics.completedClockOut}</span>
            <span className="text-xs font-semibold text-indigo-600">Completed</span>
          </div>
        </div>

        {/* Late Clock-Ins */}
        <div
          onClick={() => {
            setFilterMode('TODAY');
            setActiveTab('LATE');
          }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'LATE'
              ? 'bg-rose-50/80 border-rose-300 ring-2 ring-rose-500/20 shadow-xs'
              : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Late Clock-Ins</span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{metrics.lateCount}</span>
            <span className="text-xs font-semibold text-rose-600">Past Grace</span>
          </div>
        </div>
      </div>

      {/* Table Header Controls (Date Filter, Status Tabs & Search) */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
        {/* Date Filter & Status Tabs */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Date Selector Pill */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs">
            <button
              onClick={() => {
                setFilterMode('TODAY');
                setSelectedDate(todayStr);
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                filterMode === 'TODAY'
                  ? 'bg-white text-emerald-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setFilterMode('ALL')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                filterMode === 'ALL'
                  ? 'bg-white text-emerald-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Dates
            </button>
            <div className="relative flex items-center px-1">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setFilterMode('CUSTOM');
                }}
                className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                title="Select Specific Date"
              />
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80 overflow-x-auto">
            {[
              { key: 'ALL', label: 'All' },
              { key: 'ACTIVE_IN', label: 'In Session' },
              { key: 'CLOCKED_OUT', label: 'Clocked Out' },
              { key: 'PRESENT', label: 'Present' },
              { key: 'LATE', label: 'Late' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  activeTab === tab.key
                    ? 'bg-white text-emerald-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search staff, dept, device..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>
        </div>
      </div>

      {/* Attendance Logs Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[700px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase font-bold text-slate-500 tracking-wider">
              <tr>
                <th className="py-3.5 px-5">Employee Member</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Clock In</th>
                <th className="py-3.5 px-4">Clock Out</th>
                <th className="py-3.5 px-4">Location & Device</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-500 space-y-2">
                    <Clock className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="font-bold text-slate-700">No matching attendance records found</p>
                    <p className="text-xs text-slate-400">
                      {filterMode === 'TODAY'
                        ? 'No staff have clocked in for today yet.'
                        : 'Try adjusting your date or search filters.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => {
                  const checkIn = r.checkInTime || r.checkIn || '--';
                  const checkOut = r.checkOutTime || r.checkOut || '--';
                  const isClockedOut = checkOut && checkOut !== '--';
                  const isSelectedForDrawer = selectedRecordForDrawer?.id === r.id;

                  return (
                    <tr
                      key={r.id}
                      onClick={() => setSelectedRecordForDrawer(r)}
                      className={`transition-colors cursor-pointer group ${
                        isSelectedForDrawer
                          ? 'bg-emerald-50/80'
                          : 'hover:bg-slate-50/70'
                      }`}
                    >
                      {/* Employee Profile */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            <img
                              src={
                                r.employeeAvatar ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(r.employeeName)}&background=059669&color=fff`
                              }
                              alt={r.employeeName}
                              className="w-9 h-9 rounded-xl object-cover border border-slate-200 group-hover:ring-2 group-hover:ring-emerald-500 transition-all shadow-2xs"
                            />
                            <span
                              className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                                isClockedOut ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'
                              }`}
                              title={isClockedOut ? 'Shift Completed' : 'Session Active'}
                            />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-emerald-600 leading-snug transition-colors">
                              {r.employeeName}
                            </p>
                            <p className="text-[11px] text-slate-500 font-mono">ID: {r.employeeId}</p>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="py-3.5 px-4 font-semibold text-slate-700 whitespace-nowrap">
                        {r.department}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{r.date || todayStr}</span>
                        </div>
                      </td>

                      {/* Check In Time */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 font-mono text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200/60 shadow-2xs">
                          <LogIn className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>{checkIn}</span>
                        </span>
                      </td>

                      {/* Check Out Time */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isClockedOut ? (
                          <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-200/60 shadow-2xs">
                            <LogOut className="w-3 h-3 text-purple-600 shrink-0" />
                            <span>{checkOut}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            <span>In Session</span>
                          </span>
                        )}
                      </td>

                      {/* Location & Device */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-0.5 text-slate-600">
                          <span className="flex items-center gap-1 font-medium text-xs">
                            <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                            <span className="truncate max-w-[160px]">{r.location}</span>
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-slate-400">
                            <Smartphone className="w-3 h-3 shrink-0" />
                            <span className="truncate max-w-[160px]">{r.device}</span>
                          </span>
                        </div>
                      </td>

                      {/* Status Pill */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
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

                      {/* Details Drawer Action */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRecordForDrawer(r);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 text-xs font-bold transition-all group-hover:bg-emerald-100/80 cursor-pointer shadow-2xs"
                          title="Open Employee Punch Breakdown"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-600" />
                          <span>View</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Mark Attendance Modal */}
      <MarkAttendanceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Employee Attendance Details Slide-over Sidebar Drawer */}
      <EmployeeAttendanceDrawer
        isOpen={Boolean(selectedRecordForDrawer)}
        onClose={() => setSelectedRecordForDrawer(null)}
        record={selectedRecordForDrawer}
        employee={targetEmployeeForDrawer}
        allEmployeeRecords={records}
      />
    </div>
  );
};
