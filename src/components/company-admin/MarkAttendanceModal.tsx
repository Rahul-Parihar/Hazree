'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { AttendanceRecord, Employee } from '../../types';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { markAttendanceAsync } from '../../redux/slices/attendanceSlice';
import { Calendar, Clock, MapPin, Smartphone, User, CheckCircle2, LogIn, LogOut } from 'lucide-react';
import { validatePunchShiftWindow, formatShiftBadge } from '../../lib/shiftUtils';
import { toast } from 'sonner';

interface MarkAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedEmployee?: Employee | null;
  initialPunchType?: 'CLOCK_IN' | 'CLOCK_OUT';
  onSuccess?: () => void;
}

export const MarkAttendanceModal: React.FC<MarkAttendanceModalProps> = ({
  isOpen,
  onClose,
  preSelectedEmployee,
  initialPunchType = 'CLOCK_IN',
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const userRole = useAppSelector((state) => state.auth.userRole);
  const allEmployees = useAppSelector((state) => state.employees.employees);
  const isPunching = useAppSelector((state) => state.attendance.isPunching);
  const attendanceRecords = useAppSelector((state) => state.attendance.records);
  const companies = useAppSelector((state) => state.companies.companies);

  const currentCompany = companies.find(
    (c) =>
      c.id === currentUser?.companyId ||
      c.id === `cmp_${currentUser?.companyId}` ||
      String(c.id).replace('cmp_', '') === String(currentUser?.companyId || '').replace('cmp_', '') ||
      c.name.toLowerCase() === (currentUser?.companyName || '').toLowerCase()
  );

  // Scoped employees for current company
  const isCompanyAdmin = userRole === 'COMPANY_ADMIN';
  const myCompanyId = currentUser?.companyId ? String(currentUser.companyId).replace('cmp_', '') : undefined;
  const myCompanyName = currentUser?.companyName?.trim().toLowerCase();

  const companyEmployees = isCompanyAdmin
    ? allEmployees.filter((e) => {
        const empCompId = e.companyId ? String(e.companyId).replace('cmp_', '') : '';
        if (myCompanyId && empCompId && empCompId === myCompanyId) return true;
        if (myCompanyName && e.companyName && e.companyName.trim().toLowerCase() === myCompanyName) return true;
        return false;
      })
    : allEmployees;

  // Form State
  const [punchType, setPunchType] = useState<'CLOCK_IN' | 'CLOCK_OUT'>(initialPunchType);
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  const [empName, setEmpName] = useState('');
  const [empAvatar, setEmpAvatar] = useState('');
  const [empShift, setEmpShift] = useState<string>('');
  const [department, setDepartment] = useState('Engineering');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [checkInTime, setCheckInTime] = useState('09:00 AM');
  const [checkOutTime, setCheckOutTime] = useState('--');
  const [status, setStatus] = useState<AttendanceRecord['status']>('Present');
  const [location, setLocation] = useState('Official Office Premises (HR Override)');
  const [device, setDevice] = useState('Company Admin Portal Web');
  const [forceOverride, setForceOverride] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Validate shift window using centralized shiftUtils
  const shiftValidity = validatePunchShiftWindow(checkInTime, empShift, currentCompany);

  // When modal opens or preSelectedEmployee / initialPunchType changes, set defaults
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setForceOverride(false);
      const todayStr = new Date().toISOString().split('T')[0];
      setDate(todayStr);
      setPunchType(initialPunchType);

      // Calculate formatted current time
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
      const currentTimeStr = `${formattedHours}:${formattedMinutes} ${ampm}`;

      let targetEmp: Employee | undefined = preSelectedEmployee || undefined;
      if (!targetEmp && companyEmployees.length > 0) {
        targetEmp = companyEmployees[0];
      }

      const activeShiftStr = targetEmp?.assignedShift || currentCompany?.shiftTimings;
      const initialShiftValidation = validatePunchShiftWindow(currentTimeStr, activeShiftStr, currentCompany);
      const autoStatus = initialShiftValidation.status;

      if (targetEmp) {
        setSelectedEmpId(targetEmp.id);
        setEmpName(targetEmp.name);
        setEmpAvatar(targetEmp.avatar || '');
        setEmpShift(targetEmp.assignedShift || 'Shift 1');
        setDepartment(targetEmp.department || 'Engineering');

        // Look for existing attendance record for today
        const existingRec = attendanceRecords.find(
          (r) =>
            (r.employeeId === targetEmp?.id || r.employeeId === String(targetEmp?.id).replace('emp_', '')) &&
            (r.date === todayStr || !r.date)
        );

        if (initialPunchType === 'CLOCK_OUT') {
          setCheckInTime(existingRec?.checkIn || '09:00 AM');
          setCheckOutTime(currentTimeStr);
          setStatus(existingRec?.status || autoStatus);
        } else {
          setCheckInTime(currentTimeStr);
          setCheckOutTime('--');
          setStatus(autoStatus);
        }
      } else {
        setSelectedEmpId('');
        setEmpName('');
        setEmpAvatar('');
        setEmpShift('');
        setDepartment('Engineering');
        setCheckInTime(currentTimeStr);
        setCheckOutTime('--');
        setStatus(autoStatus);
      }
    }
  }, [isOpen, preSelectedEmployee, initialPunchType, companyEmployees.length, currentCompany]);

  const handleEmployeeSelect = (empId: string) => {
    setSelectedEmpId(empId);
    setForceOverride(false);
    const emp = companyEmployees.find((e) => e.id === empId);
    if (emp) {
      setEmpName(emp.name);
      setEmpAvatar(emp.avatar || '');
      setEmpShift(emp.assignedShift || 'Shift 1');
      setDepartment(emp.department || 'Engineering');

      const todayStr = date || new Date().toISOString().split('T')[0];
      const existingRec = attendanceRecords.find(
        (r) =>
          (r.employeeId === emp.id || r.employeeId === String(emp.id).replace('emp_', '')) &&
          (r.date === todayStr || !r.date)
      );

      const activeShiftStr = emp.assignedShift || currentCompany?.shiftTimings;
      const empShiftValidation = validatePunchShiftWindow(checkInTime, activeShiftStr, currentCompany);
      const autoStatus = empShiftValidation.status;

      if (existingRec && existingRec.checkIn && (!existingRec.checkOut || existingRec.checkOut === '--')) {
        setPunchType('CLOCK_OUT');
        setCheckInTime(existingRec.checkIn);
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12;
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
        setCheckOutTime(`${formattedHours}:${formattedMinutes} ${ampm}`);
        setStatus(existingRec.status || autoStatus);
      } else {
        setStatus(autoStatus);
      }
    }
  };

  const handleTogglePunchType = (type: 'CLOCK_IN' | 'CLOCK_OUT') => {
    setPunchType(type);
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const currentTimeStr = `${formattedHours}:${formattedMinutes} ${ampm}`;

    if (type === 'CLOCK_OUT') {
      if (checkOutTime === '--' || !checkOutTime) {
        setCheckOutTime(currentTimeStr);
      }
    } else {
      setCheckInTime(currentTimeStr);
      setCheckOutTime('--');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName.trim()) {
      setErrorMessage('Please select or specify employee name');
      return;
    }

    if (punchType === 'CLOCK_IN' && !shiftValidity.isValid && !forceOverride) {
      setErrorMessage(`${shiftValidity.reason} Please enable HR Override below to proceed.`);
      return;
    }

    setErrorMessage(null);

    const targetCompanyId = currentUser?.companyId
      ? Number(String(currentUser.companyId).replace('cmp_', ''))
      : undefined;

    const rawEmpId = selectedEmpId ? Number(selectedEmpId.replace('emp_', '')) : undefined;

    const result = await dispatch(
      markAttendanceAsync({
        employee_id: !isNaN(rawEmpId as number) ? rawEmpId : undefined,
        employee_name: empName.trim(),
        employee_avatar: empAvatar,
        department: department,
        company_id: targetCompanyId,
        date: date,
        check_in_time: checkInTime,
        check_out_time: punchType === 'CLOCK_OUT' ? checkOutTime || '--' : '--',
        status: status,
        work_hours: status === 'Absent' ? '0h' : status === 'Half Day' ? '4h 00m' : punchType === 'CLOCK_OUT' ? 'Completed' : 'Active',
        location: location,
        device: device,
        force_override: forceOverride,
      })
    );

    if (markAttendanceAsync.fulfilled.match(result)) {
      toast.success(
        punchType === 'CLOCK_IN'
          ? `Clock In recorded for ${empName.trim()} at ${checkInTime}`
          : `Clock Out recorded for ${empName.trim()} at ${checkOutTime}`
      );
      onClose();
      if (onSuccess) onSuccess();
    } else if (markAttendanceAsync.rejected.match(result)) {
      const err = (result.payload as string) || 'Failed to record punch: Outside shift window';
      setErrorMessage(err);
      toast.error(err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={punchType === 'CLOCK_OUT' ? 'Clock Out Attendance Punch' : 'Clock In Attendance Punch'}
      subtitle={`Record ${punchType === 'CLOCK_OUT' ? 'Clock Out' : 'Clock In'} punch for ${empName || currentUser?.companyName || 'Staff Member'}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-semibold">
            {errorMessage}
          </div>
        )}

        {/* Punch Type Selector Switch */}
        <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => handleTogglePunchType('CLOCK_IN')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              punchType === 'CLOCK_IN'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Clock In (Punch In)</span>
          </button>

          <button
            type="button"
            onClick={() => handleTogglePunchType('CLOCK_OUT')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              punchType === 'CLOCK_OUT'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LogOut className="w-4 h-4" />
            <span>Clock Out (Punch Out)</span>
          </button>
        </div>

        {/* 1. Employee Selection */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
            <span>Select Staff Member</span>
            <span className="text-[10px] text-slate-400 font-normal lowercase">
              {companyEmployees.length} registered staff
            </span>
          </label>

          {companyEmployees.length > 0 ? (
            <select
              value={selectedEmpId}
              onChange={(e) => handleEmployeeSelect(e.target.value)}
              className="w-full rounded-xl bg-white border border-slate-200 text-slate-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              {companyEmployees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} — {emp.role} ({emp.department})
                </option>
              ))}
            </select>
          ) : (
            <Input
              placeholder="e.g. Aarav Sharma"
              value={empName}
              onChange={(e) => setEmpName(e.target.value)}
              required
            />
          )}
        </div>

        {/* Selected Employee Preview Card */}
        {empName && (
          <div className="flex items-center justify-between gap-3 p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl">
            <div className="flex items-center gap-3 min-w-0">
              {empAvatar ? (
                <img
                  src={empAvatar}
                  alt={empName}
                  className="w-10 h-10 rounded-xl object-cover border border-emerald-300 shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {empName.charAt(0)}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-bold text-slate-900 text-sm truncate">{empName}</p>
                <p className="text-xs text-emerald-800 font-medium truncate">
                  Department: <strong>{department}</strong>
                </p>
              </div>
            </div>

            {empShift && (
              <div className="flex flex-col items-end gap-0.5 shrink-0">
                <div className="flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-lg border bg-white text-indigo-950 border-indigo-200 shadow-2xs">
                  <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>{shiftValidity.shiftName}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500 font-semibold">
                  {shiftValidity.shiftStart} - {shiftValidity.shiftEnd}
                </span>
              </div>
            )}
          </div>
        )}

        {/* 2. Attendance Status & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Attendance Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as AttendanceRecord['status'])}
              className="w-full rounded-xl bg-white border border-slate-200 text-slate-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              <option value="Present">Present (On Time)</option>
              <option value="Late">Late Arrival</option>
              <option value="Half Day">Half Day Shift</option>
              <option value="Absent">Unexcused Absent</option>
            </select>
          </div>

          <Input
            label="Attendance Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        {/* 3. Live Auto-Recorded Timestamp Card (Replaces manual 09:00 AM / 06:00 PM text inputs) */}
        <div className="p-3.5 rounded-2xl border text-center space-y-1 bg-slate-50/90 border-slate-200/80">
          {punchType === 'CLOCK_IN' ? (
            <div className="bg-emerald-50/90 border border-emerald-200/80 p-3 rounded-xl">
              <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Clock In Timestamp
              </p>
              <p className="text-2xl font-black text-emerald-950 font-mono mt-1">
                {checkInTime}
              </p>
              <p className="text-[11px] text-emerald-700 font-medium">
                Current exact minute will be saved automatically
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-white border border-slate-200 p-2.5 rounded-xl text-center">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Clock In Time</p>
                <p className="text-sm font-extrabold text-slate-900 font-mono mt-0.5">{checkInTime}</p>
              </div>
              <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-center">
                <p className="text-[10px] font-bold text-amber-800 uppercase flex items-center justify-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Clock Out (Live)
                </p>
                <p className="text-sm font-extrabold text-amber-950 font-mono mt-0.5">{checkOutTime}</p>
              </div>
            </div>
          )}
        </div>

        {/* 4. Location & Device */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Location / Workplace
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-xl bg-white border border-slate-200 text-slate-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Official Office Premises (HR Override)">Official Office Premises (HR Override)</option>
              <option value="Headquarters (Gate 1 Biometric)">Headquarters (Gate 1 Biometric)</option>
              <option value="Work From Home (Remote Verification)">Work From Home (Remote Verification)</option>
              <option value="Client Field Visit (GPS Tagged)">Client Field Visit (GPS Tagged)</option>
              <option value="Branch Office / Warehouse Hub">Branch Office / Warehouse Hub</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Verification Device Tag
            </label>
            <select
              value={device}
              onChange={(e) => setDevice(e.target.value)}
              className="w-full rounded-xl bg-white border border-slate-200 text-slate-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Company Admin Portal Web">Company Admin Portal Web</option>
              <option value="Facial Recognition Kiosk">Facial Recognition Kiosk</option>
              <option value="Fingerprint Biometric Device">Fingerprint Biometric Device</option>
              <option value="Mobile GPS App">Mobile GPS App</option>
            </select>
          </div>
        </div>

        {/* Shift Window Alert and Admin Override Box */}
        {punchType === 'CLOCK_IN' && !shiftValidity.isValid && (
          <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-300 text-amber-950 space-y-2.5">
            <div className="flex items-start gap-2">
              <span className="text-base">⚠️</span>
              <div className="text-xs">
                <p className="font-bold text-amber-900">Shift Timing Restriction Alert</p>
                <p className="text-amber-800 mt-0.5">{shiftValidity.reason}</p>
              </div>
            </div>

            <label className="flex items-center gap-2 p-2 bg-white/80 rounded-xl border border-amber-200 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={forceOverride}
                onChange={(e) => setForceOverride(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-800">
                Confirm HR Admin Override (Allow punch outside scheduled shift)
              </span>
            </label>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isPunching}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isPunching}
            icon={punchType === 'CLOCK_OUT' ? <LogOut className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            className={punchType === 'CLOCK_OUT' ? '!bg-amber-600 hover:!bg-amber-700 !border-amber-600' : ''}
          >
            {isPunching
              ? 'Saving Punch...'
              : punchType === 'CLOCK_OUT'
              ? 'Confirm Clock Out'
              : 'Confirm Clock In'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
