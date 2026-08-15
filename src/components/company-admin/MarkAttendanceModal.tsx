'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { AttendanceRecord, Employee } from '../../types';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { markAttendanceAsync } from '../../redux/slices/attendanceSlice';
import { Calendar, Clock, MapPin, Smartphone, User, CheckCircle2 } from 'lucide-react';

interface MarkAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedEmployee?: Employee | null;
  onSuccess?: () => void;
}

export const MarkAttendanceModal: React.FC<MarkAttendanceModalProps> = ({
  isOpen,
  onClose,
  preSelectedEmployee,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const userRole = useAppSelector((state) => state.auth.userRole);
  const allEmployees = useAppSelector((state) => state.employees.employees);
  const isPunching = useAppSelector((state) => state.attendance.isPunching);

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
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  const [empName, setEmpName] = useState('');
  const [empAvatar, setEmpAvatar] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [checkInTime, setCheckInTime] = useState('09:00 AM');
  const [checkOutTime, setCheckOutTime] = useState('--');
  const [status, setStatus] = useState<AttendanceRecord['status']>('Present');
  const [location, setLocation] = useState('Official Office Premises (HR Override)');
  const [device, setDevice] = useState('Company Admin Portal Web');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // When modal opens or preSelectedEmployee changes, set defaults
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setDate(new Date().toISOString().split('T')[0]);
      
      // Calculate formatted current time
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
      const currentTimeStr = `${formattedHours}:${formattedMinutes} ${ampm}`;

      setCheckInTime(currentTimeStr);
      setCheckOutTime('--');
      setStatus('Present');

      if (preSelectedEmployee) {
        setSelectedEmpId(preSelectedEmployee.id);
        setEmpName(preSelectedEmployee.name);
        setEmpAvatar(preSelectedEmployee.avatar || '');
        setDepartment(preSelectedEmployee.department || 'Engineering');
      } else if (companyEmployees.length > 0) {
        const first = companyEmployees[0];
        setSelectedEmpId(first.id);
        setEmpName(first.name);
        setEmpAvatar(first.avatar || '');
        setDepartment(first.department || 'Engineering');
      } else {
        setSelectedEmpId('');
        setEmpName('');
        setEmpAvatar('');
        setDepartment('Engineering');
      }
    }
  }, [isOpen, preSelectedEmployee, companyEmployees.length]);

  const handleEmployeeSelect = (empId: string) => {
    setSelectedEmpId(empId);
    const emp = companyEmployees.find((e) => e.id === empId);
    if (emp) {
      setEmpName(emp.name);
      setEmpAvatar(emp.avatar || '');
      setDepartment(emp.department || 'Engineering');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName.trim()) {
      setErrorMessage('Please select or specify employee name');
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
        check_out_time: checkOutTime || '--',
        status: status,
        work_hours: status === 'Absent' ? '0h' : status === 'Half Day' ? '4h 00m' : 'Active',
        location: location,
        device: device,
      })
    );

    if (markAttendanceAsync.fulfilled.match(result)) {
      onClose();
      if (onSuccess) onSuccess();
    } else if (markAttendanceAsync.rejected.match(result)) {
      setErrorMessage((result.payload as string) || 'Failed to mark attendance');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Mark Employee Hazree (Attendance)"
      subtitle={`Record attendance punch for ${currentUser?.companyName || 'Organization'} staff`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-semibold">
            {errorMessage}
          </div>
        )}

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
          <div className="flex items-center gap-3 p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl">
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

        {/* 3. Check-In and Check-Out Times */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Check-In Time"
            placeholder="09:00 AM"
            value={checkInTime}
            onChange={(e) => setCheckInTime(e.target.value)}
            required
          />

          <Input
            label="Check-Out Time (Optional)"
            placeholder="06:00 PM or --"
            value={checkOutTime}
            onChange={(e) => setCheckOutTime(e.target.value)}
          />
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

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isPunching}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isPunching}
            icon={<CheckCircle2 className="w-4 h-4" />}
          >
            {isPunching ? 'Saving Punch...' : 'Confirm Attendance'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
