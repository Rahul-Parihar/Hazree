'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Download,
  Mail,
  Phone,
  Building2,
  Briefcase,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  Plus,
  RefreshCw,
  Edit,
  Save,
  X,
  Printer,
  ShieldCheck,
  LogIn,
  LogOut,
} from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { Modal } from '../../../../components/ui/Modal';
import { Input } from '../../../../components/ui/Input';
import { useAppDispatch, useAppSelector } from '../../../../redux/hooks';
import { fetchEmployeesAsync } from '../../../../redux/slices/employeesSlice';
import {
  fetchAttendanceAsync,
  markAttendanceAsync,
} from '../../../../redux/slices/attendanceSlice';
import { EditEmployeeModal } from '../../../../components/company-admin/EditEmployeeModal';
import { Employee, AttendanceRecord, AttendanceStatus } from '../../../../types';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const userRole = useAppSelector((state) => state.auth.userRole);
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const isCompanyAdmin = userRole === 'COMPANY_ADMIN';

  const rawParamId = Array.isArray(params.id) ? params.id[0] : params.id;
  const employeeId = rawParamId ? String(rawParamId).replace('emp_', '') : '';

  const employees = useAppSelector((state) => state.employees.employees);
  const companies = useAppSelector((state) => state.companies.companies);
  const attendanceRecords = useAppSelector((state) => state.attendance.records);
  const isPunching = useAppSelector((state) => state.attendance.isPunching);

  // Selected Month & Year (defaults to current date e.g. August 2026)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth()); // 0-indexed

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDayPunchModalOpen, setIsDayPunchModalOpen] = useState(false);
  const [selectedDateForPunch, setSelectedDateForPunch] = useState<string>('');
  const [punchStatus, setPunchStatus] = useState<AttendanceStatus>('Present');
  const [punchCheckIn, setPunchCheckIn] = useState('09:00 AM');
  const [punchCheckOut, setPunchCheckOut] = useState('06:00 PM');
  const [punchLocation, setPunchLocation] = useState('Office Premises (Verified)');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Find Employee
  const employee: Employee | undefined = useMemo(() => {
    return employees.find(
      (e) => e.id === `emp_${employeeId}` || e.id === employeeId || String(e.id).replace('emp_', '') === employeeId
    );
  }, [employees, employeeId]);

  // Find Employee's Company for Saturday / Weekend Policy
  const employeeCompany = useMemo(() => {
    if (!employee) return null;
    return (
      companies.find(
        (c) =>
          c.id === employee.companyId ||
          c.id === `cmp_${employee.companyId}` ||
          String(c.id).replace('cmp_', '') === String(employee.companyId || '').replace('cmp_', '') ||
          c.name.toLowerCase() === (employee.companyName || '').toLowerCase()
      ) || (companies.length > 0 ? companies[0] : null)
    );
  }, [companies, employee]);

  const saturdayPolicy = employeeCompany?.saturdayPolicy || 'ALL_WORKING';

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const todayPunch = useMemo(() => {
    return attendanceRecords.find(
      (r) =>
        (r.date === todayStr || !r.date) &&
        (r.employeeId === `emp_${employeeId}` ||
          r.employeeId === employeeId ||
          String(r.employeeId).replace('emp_', '') === employeeId)
    );
  }, [attendanceRecords, todayStr, employeeId]);

  const isClockedIn = Boolean(todayPunch && todayPunch.checkIn && todayPunch.checkIn !== '--');
  const isClockedOut = Boolean(isClockedIn && todayPunch && todayPunch.checkOut && todayPunch.checkOut !== '--');

  // Load employee & companies
  useEffect(() => {
    dispatch(fetchEmployeesAsync());
  }, [dispatch]);

  const monthQueryString = useMemo(() => {
    const mm = String(selectedMonth + 1).padStart(2, '0');
    return `${selectedYear}-${mm}`;
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    if (employeeId) {
      dispatch(
        fetchAttendanceAsync({
          employeeId: Number(employeeId),
          month: monthQueryString,
        })
      );
    }
  }, [dispatch, employeeId, monthQueryString]);

  // Helper to determine if a date is an automatic Day Off based on company's Saturday/Weekend policy
  const isDateDayOff = (dateObj: Date, policy: string): boolean => {
    const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 6 = Saturday
    if (dayOfWeek === 0) return true; // Sunday is always off

    if (dayOfWeek === 6) {
      // Saturday: check which Saturday of the month it is (1st, 2nd, 3rd, 4th, 5th)
      const dayOfMonth = dateObj.getDate();
      const saturdayIndex = Math.ceil(dayOfMonth / 7);

      if (policy === 'ALL_OFF') {
        return true; // 5-day week: All Saturdays off
      }
      if (policy === 'SECOND_FOURTH_OFF') {
        return saturdayIndex === 2 || saturdayIndex === 4; // 2nd & 4th Sat off
      }
      if (policy === 'FIRST_THIRD_OFF') {
        return saturdayIndex === 1 || saturdayIndex === 3; // 1st & 3rd Sat off
      }
      if (policy === 'ALL_WORKING') {
        return false; // All Saturdays are working days
      }
    }

    return false;
  };

  // Generate calendar days for selected month
  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const days = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(selectedYear, selectedMonth, day);
      const dayOfWeek = DAY_NAMES[dateObj.getDay()];
      const isDayOff = isDateDayOff(dateObj, saturdayPolicy);
      const isSunday = dateObj.getDay() === 0;
      const isSaturday = dateObj.getDay() === 6;
      const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      // Find punch record for this day
      const punch = attendanceRecords.find(
        (r) =>
          r.date === dateStr &&
          (r.employeeId === `emp_${employeeId}` ||
            r.employeeId === employeeId ||
            String(r.employeeId).replace('emp_', '') === employeeId)
      );

      days.push({
        dayNumber: day,
        dayOfWeek,
        isDayOff,
        isSunday,
        isSaturday,
        dateStr,
        punch,
      });
    }

    return days;
  }, [selectedYear, selectedMonth, attendanceRecords, employeeId, saturdayPolicy]);

  // Compute monthly stats
  const monthlyStats = useMemo(() => {
    let presentCount = 0;
    let lateCount = 0;
    let halfDayCount = 0;
    let absentCount = 0;
    let leaveCount = 0;
    let holidayCount = 0;
    let dayOffCount = 0;

    calendarDays.forEach((d) => {
      if (d.punch) {
        const s = (d.punch.status || '').toLowerCase();
        if (s === 'present') presentCount++;
        else if (s === 'late') {
          presentCount++;
          lateCount++;
        } else if (s === 'half day' || s === 'half-day') halfDayCount++;
        else if (s === 'absent') absentCount++;
        else if (s === 'on leave' || s === 'leave') leaveCount++;
        else if (s === 'holiday') holidayCount++;
        else if (s === 'day off') dayOffCount++;
      } else if (d.isDayOff) {
        dayOffCount++;
      }
    });

    const totalDays = calendarDays.length;
    const workingDays = Math.max(1, totalDays - dayOffCount - holidayCount);
    const effectivePresent = presentCount + halfDayCount * 0.5;
    const attendancePercentage = Math.min(100, Math.round((effectivePresent / workingDays) * 100));

    return {
      totalDays,
      presentCount,
      lateCount,
      halfDayCount,
      absentCount,
      leaveCount,
      holidayCount,
      dayOffCount,
      workingDays,
      attendancePercentage: isNaN(attendancePercentage) ? 100 : attendancePercentage,
    };
  }, [calendarDays]);

  // Month navigation
  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  // Open Quick Punch for a specific day
  const handleOpenDayPunch = (dateStr: string, existingPunch?: AttendanceRecord) => {
    if (!isCompanyAdmin) return;
    setSelectedDateForPunch(dateStr);
    if (existingPunch) {
      setPunchStatus(existingPunch.status || 'Present');
      setPunchCheckIn(existingPunch.checkIn || existingPunch.checkInTime || '09:00 AM');
      setPunchCheckOut(existingPunch.checkOut || existingPunch.checkOutTime || '06:00 PM');
      setPunchLocation(existingPunch.location || 'Office Premises (Verified)');
    } else {
      setPunchStatus('Present');
      setPunchCheckIn('09:00 AM');
      setPunchCheckOut('06:00 PM');
      setPunchLocation('Office Premises (Verified)');
    }
    setIsDayPunchModalOpen(true);
  };

  // Save Day Punch to Server
  const handleSaveDayPunch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee || !selectedDateForPunch) return;

    try {
      const rawCompId = employee.companyId ? Number(String(employee.companyId).replace('cmp_', '')) : undefined;

      await dispatch(
        markAttendanceAsync({
          employee_id: Number(employeeId),
          employee_name: employee.name,
          employee_avatar: employee.avatar,
          department: employee.department,
          company_id: rawCompId,
          date: selectedDateForPunch,
          check_in_time: punchCheckIn,
          check_out_time: punchCheckOut,
          status: punchStatus,
          location: punchLocation,
          device: 'Admin Console Calendar Override',
        })
      );

      setSaveSuccessMsg(`Attendance updated for ${selectedDateForPunch}`);
      setTimeout(() => setSaveSuccessMsg(null), 3000);
      setIsDayPunchModalOpen(false);

      // Refresh records
      dispatch(
        fetchAttendanceAsync({
          employeeId: Number(employeeId),
          month: monthQueryString,
        })
      );
    } catch (err) {
      console.error('Failed to save punch:', err);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!employee) return;
    const headers = ['Date', 'Day', 'Status', 'Check In', 'Check Out', 'Location'];
    const rows = calendarDays.map((d) => {
      const punch = d.punch;
      const status = punch ? punch.status : d.isDayOff ? 'Day Off' : 'Not Recorded';
      const checkIn = punch?.checkIn || punch?.checkInTime || '--';
      const checkOut = punch?.checkOut || punch?.checkOutTime || '--';
      const location = punch?.location || '--';
      return [d.dateStr, d.dayOfWeek, status, checkIn, checkOut, `"${location}"`].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${employee.name.replace(/\s+/g, '_')}_Attendance_${monthQueryString}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Render Status Icon for Calendar Matrix
  const renderStatusIcon = (day: (typeof calendarDays)[0]) => {
    const punch = day.punch;
    if (!punch) {
      if (day.isDayOff) {
        return (
          <span
            className="text-slate-400 text-xs font-semibold select-none"
            title={`Day Off (${day.dayOfWeek})`}
          >
            📅
          </span>
        );
      }
      return (
        <span
          className="text-slate-300 font-bold text-sm select-none"
          title={`Working Day (${day.dayOfWeek}) - Punch Pending`}
        >
          -
        </span>
      );
    }

    const s = (punch.status || '').toLowerCase();
    if (s === 'present') {
      return (
        <span
          className="inline-flex items-center justify-center text-emerald-600 font-black text-sm select-none"
          title={`Present (In: ${punch.checkIn || '09:00 AM'}, Out: ${punch.checkOut || '06:00 PM'})`}
        >
          ✔️
        </span>
      );
    }
    if (s === 'absent') {
      return (
        <span
          className="inline-flex items-center justify-center text-rose-500 font-black text-sm select-none"
          title="Absent"
        >
          ❌
        </span>
      );
    }
    if (s === 'late') {
      return (
        <span
          className="inline-flex items-center justify-center text-amber-500 font-black text-sm select-none"
          title={`Late Arrival (In: ${punch.checkIn || '--'})`}
        >
          ❗
        </span>
      );
    }
    if (s === 'half day' || s === 'half-day') {
      return (
        <span
          className="inline-flex items-center justify-center text-amber-500 font-black text-sm select-none"
          title="Half Day Session"
        >
          🌟
        </span>
      );
    }
    if (s === 'on leave' || s === 'leave') {
      return (
        <span
          className="inline-flex items-center justify-center text-sky-500 font-black text-sm select-none"
          title="Approved Leave"
        >
          🛫
        </span>
      );
    }
    if (s === 'holiday') {
      return (
        <span
          className="inline-flex items-center justify-center text-amber-400 font-black text-sm select-none"
          title="Official Holiday"
        >
          ⭐
        </span>
      );
    }
    if (s === 'day off') {
      return (
        <span
          className="inline-flex items-center justify-center text-blue-500 font-black text-xs select-none"
          title="Scheduled Day Off"
        >
          📅
        </span>
      );
    }

    return (
      <span className="inline-flex items-center justify-center text-emerald-600 font-black text-sm select-none">
        ✔️
      </span>
    );
  };

  if (!employee) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <Link
            href="/employees"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-slate-900">Employee Profile</h1>
        </div>
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-4 shadow-xs">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Employee Record Loading or Not Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Retrieving employee details from the system directory. If this persists, return to the employee directory.
          </p>
          <Link
            href="/employees"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Employee List</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16 animate-fade-in">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/employees"
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {employee.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                {employee.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Attendance Timesheet & Biometric Punch Logs • {employee.department}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {isCompanyAdmin && (
            <>
              {!isClockedIn ? (
                <button
                  type="button"
                  onClick={() => handleOpenDayPunch(todayStr, todayPunch)}
                  title="Clock in staff for today"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Clock In</span>
                </button>
              ) : !isClockedOut ? (
                <button
                  type="button"
                  onClick={() => handleOpenDayPunch(todayStr, todayPunch)}
                  title={`Clocked In at ${todayPunch?.checkIn || '--'}. Click to Clock Out.`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-amber-700" />
                  <span>Clock Out</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleOpenDayPunch(todayStr, todayPunch)}
                  title="Attendance session complete. Click to adjust punch details."
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Clocked Out ({todayPunch?.checkOut})</span>
                </button>
              )}
            </>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            icon={<Download className="w-4 h-4" />}
          >
            Export CSV
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            icon={<Printer className="w-4 h-4" />}
          >
            Print
          </Button>

          {isCompanyAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
              icon={<Edit className="w-4 h-4" />}
            >
              Edit Staff
            </Button>
          )}
        </div>
      </div>

      {/* Success Notification */}
      {saveSuccessMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs font-semibold flex items-center gap-2 shadow-xs animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Employee Profile Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 min-w-0">
          <img
            src={employee.avatar}
            alt={employee.name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-emerald-500/20 shadow-md shrink-0"
          />
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 truncate">
                {employee.name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                {employee.role}
              </span>
            </div>

            <p className="text-xs text-slate-600 flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                {employee.department}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-500">
                <Building2 className="w-3.5 h-3.5" />
                {employee.companyName || 'Organization'}
              </span>
            </p>

            <div className="flex items-center gap-4 text-xs text-slate-500 pt-1 flex-wrap">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {employee.email}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {employee.phone || '+91 98000 00000'}
              </span>
              <span className="flex items-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                Joined: {employee.joinDate || '14/08/2026'}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                <span>⚖️ Weekend:</span>
                <span>
                  {saturdayPolicy === 'ALL_WORKING'
                    ? 'All Saturdays Working (6-day)'
                    : saturdayPolicy === 'SECOND_FOURTH_OFF'
                      ? '2nd & 4th Saturday Off'
                      : saturdayPolicy === 'ALL_OFF'
                        ? 'All Saturdays Off (5-day)'
                        : saturdayPolicy === 'FIRST_THIRD_OFF'
                          ? '1st & 3rd Saturday Off'
                          : saturdayPolicy}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Monthly Attendance Rating Meter */}
        <div className="flex items-center gap-4 bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl shrink-0 w-full md:w-auto justify-between md:justify-start">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              {MONTH_NAMES[selectedMonth]} Performance
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-black text-slate-900">{monthlyStats.attendancePercentage}%</span>
              <span className="text-[11px] font-bold text-emerald-600">Attendance</span>
            </div>
          </div>

          <div className="h-10 w-px bg-slate-200" />

          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Present / Total</span>
            <span className="text-sm font-extrabold text-slate-900">
              {monthlyStats.presentCount} / {monthlyStats.totalDays} Days
            </span>
          </div>
        </div>
      </div>

      {/* Month Picker & Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-extrabold text-slate-900">
              {MONTH_NAMES[selectedMonth]} {selectedYear}
            </span>
          </div>

          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedMonth(new Date().getMonth());
              setSelectedYear(new Date().getFullYear());
            }}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Current Month
          </button>
        </div>
      </div>

      {/* Monthly Statistics Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Days</span>
          <span className="text-xl font-black text-slate-800 mt-1 block">{monthlyStats.totalDays}</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/30 shadow-xs text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block flex items-center justify-center gap-1">
            <span>✔️</span> Present
          </span>
          <span className="text-xl font-black text-emerald-700 mt-1 block">{monthlyStats.presentCount}</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-amber-200 bg-amber-50/30 shadow-xs text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block flex items-center justify-center gap-1">
            <span>❗</span> Late
          </span>
          <span className="text-xl font-black text-amber-700 mt-1 block">{monthlyStats.lateCount}</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-orange-200 bg-orange-50/30 shadow-xs text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 block flex items-center justify-center gap-1">
            <span>🌟</span> Half Day
          </span>
          <span className="text-xl font-black text-orange-700 mt-1 block">{monthlyStats.halfDayCount}</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-rose-200 bg-rose-50/30 shadow-xs text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block flex items-center justify-center gap-1">
            <span>❌</span> Absent
          </span>
          <span className="text-xl font-black text-rose-700 mt-1 block">{monthlyStats.absentCount}</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-sky-200 bg-sky-50/30 shadow-xs text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 block flex items-center justify-center gap-1">
            <span>🛫</span> On Leave
          </span>
          <span className="text-xl font-black text-sky-700 mt-1 block">{monthlyStats.leaveCount}</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-indigo-200 bg-indigo-50/30 shadow-xs text-center col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block flex items-center justify-center gap-1">
            <span>⭐</span> Holiday
          </span>
          <span className="text-xl font-black text-indigo-700 mt-1 block">{monthlyStats.holidayCount}</span>
        </div>
      </div>

      {/* Monthly Attendance Calendar Matrix (Screenshot Match) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden space-y-4 p-5 sm:p-6">
        {/* Legend / Note Bar */}
        <div className="bg-slate-50/80 border border-slate-200/70 p-3.5 rounded-xl text-xs font-semibold text-slate-700 flex items-center flex-wrap gap-x-4 gap-y-2">
          <span className="font-extrabold text-slate-900">Note:</span>
          <span className="flex items-center gap-1.5">
            <span className="text-amber-500">⭐</span> <span>→ Holiday</span>
          </span>
          <span className="text-slate-300">|</span>
          <span className="flex items-center gap-1.5">
            <span>📅</span> <span>→ Day Off</span>
          </span>
          <span className="text-slate-300">|</span>
          <span className="flex items-center gap-1.5">
            <span className="text-emerald-600">✔️</span> <span>→ Present</span>
          </span>
          <span className="text-slate-300">|</span>
          <span className="flex items-center gap-1.5">
            <span className="text-orange-500">🌟</span> <span>→ Half Day</span>
          </span>
          <span className="text-slate-300">|</span>
          <span className="flex items-center gap-1.5">
            <span className="text-amber-500">❗</span> <span>→ Late</span>
          </span>
          <span className="text-slate-300">|</span>
          <span className="flex items-center gap-1.5">
            <span className="text-rose-500">❌</span> <span>→ Absent</span>
          </span>
          <span className="text-slate-300">|</span>
          <span className="flex items-center gap-1.5">
            <span className="text-sky-500">🛫</span> <span>→ On Leave</span>
          </span>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-center border-collapse min-w-[960px]">
            <thead>
              {/* Day numbers (1, 2, 3...) */}
              <tr className="bg-slate-100/80 text-[11px] font-extrabold text-slate-700 border-b border-slate-200">
                <th className="py-2.5 px-3 text-left w-48 min-w-[190px] border-r border-slate-200 font-bold uppercase tracking-wider text-slate-600">
                  Employee
                </th>
                {calendarDays.map((d) => (
                  <th
                    key={d.dayNumber}
                    className={`py-1.5 px-1 min-w-[28px] ${d.isDayOff ? 'bg-slate-200/60 text-slate-700 font-black' : d.isSunday ? 'bg-rose-50/60 text-rose-700' : ''
                      }`}
                  >
                    {d.dayNumber}
                  </th>
                ))}
                <th className="py-2.5 px-3 font-extrabold text-slate-900 border-l border-slate-200 min-w-[70px]">
                  Total
                </th>
              </tr>

              {/* Day of Week (Sat, Sun, Mon...) */}
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 border-b border-slate-200">
                <th className="py-1 px-3 text-left border-r border-slate-200 text-slate-400 font-normal">
                  {MONTH_NAMES[selectedMonth]} {selectedYear}
                </th>
                {calendarDays.map((d) => (
                  <th
                    key={d.dayNumber}
                    className={`py-1 px-1 min-w-[28px] ${d.isDayOff ? 'bg-slate-200/60 text-slate-700 font-black' : d.isSunday ? 'bg-rose-50/60 text-rose-600 font-black' : 'text-slate-400'
                      }`}
                  >
                    {d.dayOfWeek}
                  </th>
                ))}
                <th className="py-1 px-3 border-l border-slate-200 text-slate-500 font-bold">
                  Days
                </th>
              </tr>
            </thead>

            <tbody>
              <tr className="hover:bg-slate-50/50 transition-colors">
                {/* Employee Info Header Column */}
                <td className="py-3 px-3 text-left border-r border-slate-200 bg-white">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={employee.avatar}
                      alt={employee.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-extrabold text-xs text-slate-900 truncate leading-tight">
                        {employee.name}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate leading-tight mt-0.5">
                        {employee.role}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Day status cells */}
                {calendarDays.map((d) => (
                  <td
                    key={d.dayNumber}
                    onClick={() => handleOpenDayPunch(d.dateStr, d.punch)}
                    className={`py-2 px-1 text-center transition-all ${isCompanyAdmin
                        ? 'cursor-pointer hover:bg-emerald-50/80 hover:scale-105 active:scale-95'
                        : ''
                      } ${d.isDayOff ? 'bg-slate-100/70' : ''}`}
                    title={
                      isCompanyAdmin
                        ? `Click to update attendance for ${d.dateStr}`
                        : `Attendance for ${d.dateStr}`
                    }
                  >
                    <div className="flex items-center justify-center min-h-[24px]">
                      {renderStatusIcon(d)}
                    </div>
                  </td>
                ))}

                {/* Total Column */}
                <td className="py-3 px-3 font-black text-xs text-slate-900 border-l border-slate-200 bg-slate-50/50 text-center whitespace-nowrap">
                  {monthlyStats.presentCount} / {monthlyStats.totalDays}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Monthly Attendance Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden space-y-3 p-5 sm:p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              Detailed Punch Log History
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Day-by-day biometric timestamps, work duration and verification locations
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-3.5">Date & Day</th>
                <th className="py-3 px-3.5">Status</th>
                <th className="py-3 px-3.5">Check In</th>
                <th className="py-3 px-3.5">Check Out</th>
                <th className="py-3 px-3.5">Work Hours</th>
                <th className="py-3 px-3.5">Location & Device</th>
                {isCompanyAdmin && <th className="py-3 px-3.5 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {calendarDays.map((d) => {
                const punch = d.punch;
                const status = punch ? punch.status : d.isDayOff ? 'Day Off' : 'Not Recorded';
                const checkIn = punch?.checkIn || punch?.checkInTime || '--';
                const checkOut = punch?.checkOut || punch?.checkOutTime || '--';
                const workHours = punch?.workHours || (punch ? 'Completed' : '--');
                const location = punch?.location || (d.isDayOff ? 'Weekend Off' : '--');

                return (
                  <tr key={d.dayNumber} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-3.5 font-semibold text-slate-800">
                      <span>{d.dateStr}</span>
                      <span className="ml-2 text-[10px] text-slate-400 font-bold uppercase">
                        ({d.dayOfWeek})
                      </span>
                    </td>

                    <td className="py-2.5 px-3.5">
                      <Badge
                        variant={
                          status === 'Present'
                            ? 'active'
                            : status === 'Late' || status === 'Half Day'
                              ? 'pending'
                              : status === 'Absent'
                                ? 'inactive'
                                : 'neutral'
                        }
                      >
                        {status}
                      </Badge>
                    </td>

                    <td className="py-2.5 px-3.5 font-mono text-slate-700">{checkIn}</td>
                    <td className="py-2.5 px-3.5 font-mono text-slate-700">{checkOut}</td>
                    <td className="py-2.5 px-3.5 text-slate-600">{workHours}</td>
                    <td className="py-2.5 px-3.5 text-slate-500 text-[11px] truncate max-w-[200px]">
                      {location}
                    </td>

                    {isCompanyAdmin && (
                      <td className="py-2.5 px-3.5 text-right">
                        <button
                          onClick={() => handleOpenDayPunch(d.dateStr, punch)}
                          className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                        >
                          {punch ? 'Adjust' : 'Mark'}
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Employee Profile Modal */}
      {isEditModalOpen && (
        <EditEmployeeModal
          isOpen={isEditModalOpen}
          employee={employee}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => {
            dispatch(fetchEmployeesAsync());
          }}
        />
      )}

      {/* Quick Attendance Punch / Adjust Modal */}
      {isDayPunchModalOpen && (
        <Modal
          isOpen={isDayPunchModalOpen}
          onClose={() => setIsDayPunchModalOpen(false)}
          title="Mark / Adjust Attendance"
          subtitle={`${employee.name} • ${selectedDateForPunch}`}
          maxWidth="sm"
        >
          <form onSubmit={handleSaveDayPunch} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Attendance Status *
              </label>
              <select
                value={punchStatus}
                onChange={(e) => setPunchStatus(e.target.value as AttendanceStatus)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="Present">✔️ Present</option>
                <option value="Late">❗ Late Arrival</option>
                <option value="Half Day">🌟 Half Day</option>
                <option value="Absent">❌ Absent</option>
                <option value="On Leave">🛫 On Leave</option>
                <option value="Holiday">⭐ Holiday</option>
                <option value="Day Off">📅 Day Off</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Check In Time"
                value={punchCheckIn}
                onChange={(e) => setPunchCheckIn(e.target.value)}
                placeholder="09:00 AM"
                icon={<Clock className="w-4 h-4" />}
              />
              <Input
                label="Check Out Time"
                value={punchCheckOut}
                onChange={(e) => setPunchCheckOut(e.target.value)}
                placeholder="06:00 PM"
                icon={<Clock className="w-4 h-4" />}
              />
            </div>

            <Input
              label="Location / Note"
              value={punchLocation}
              onChange={(e) => setPunchLocation(e.target.value)}
              placeholder="Office Premises / Remote"
              icon={<Building2 className="w-4 h-4" />}
            />

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsDayPunchModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isPunching}
                icon={<Save className="w-4 h-4" />}
              >
                Save Attendance
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
