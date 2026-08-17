"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  EmployeeProfile,
  PunchRecord,
  LeaveBalance,
  LeaveRequest,
} from "../types/customer";
import {
  employeeService,
  attendanceService,
  leaveService,
} from "../services";
import { checkBackendHealth } from "../lib/api";

interface ToastNotification {
  id: string;
  text: string;
  type: "success" | "info" | "error";
}

interface CustomerAppContextType {
  employees: EmployeeProfile[];
  activeEmployee: EmployeeProfile;
  setActiveEmployee: (emp: EmployeeProfile) => void;
  punchRecords: PunchRecord[];
  todayPunch?: PunchRecord;
  leaveBalance: LeaveBalance;
  leaveRequests: LeaveRequest[];
  backendOnline: boolean;
  toasts: ToastNotification[];
  showToast: (text: string, type?: "success" | "info" | "error") => void;
  removeToast: (id: string) => void;
  recordPunch: (
    type?: "Web App" | "Mobile GPS" | "Kiosk PIN" | "Biometric",
    geofenceStatus?: "Inside" | "Outside" | "Remote Verified",
    distanceMeters?: number,
    selfieSnapshot?: string
  ) => void;
  applyLeave: (leaveData: any) => void;
}

const CustomerAppContext = createContext<CustomerAppContextType | undefined>(
  undefined
);

export function CustomerAppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [activeEmployee, setActiveEmployeeState] =
    useState<EmployeeProfile | null>(null);
  const [punchRecords, setPunchRecords] = useState<PunchRecord[]>([]);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance | null>(null);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  useEffect(() => {
    const emps = employeeService.getAllEmployees();
    setEmployees(emps);

    const active = employeeService.getCurrentEmployee();
    setActiveEmployeeState(active);

    setPunchRecords(attendanceService.getAllPunches());
    setLeaveBalance(leaveService.getLeaveBalance());
    setLeaveRequests(leaveService.getLeaveRequests(active.id));

    checkBackendHealth().then((status) => setBackendOnline(status));
  }, []);

  const showToast = (
    text: string,
    type: "success" | "info" | "error" = "success"
  ) => {
    const newToast: ToastNotification = {
      id: `${Date.now()}-${Math.random()}`,
      text,
      type,
    };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      removeToast(newToast.id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const setActiveEmployee = (emp: EmployeeProfile) => {
    setActiveEmployeeState(emp);
    employeeService.setCurrentEmployee(emp.id);
    setLeaveRequests(leaveService.getLeaveRequests(emp.id));
    showToast(`Switched active profile to ${emp.fullName}`, "info");
  };

  const recordPunch = (
    type: "Web App" | "Mobile GPS" | "Kiosk PIN" | "Biometric" = "Web App",
    geofenceStatus: "Inside" | "Outside" | "Remote Verified" = "Inside",
    distanceMeters: number = 12,
    selfieSnapshot?: string
  ) => {
    if (!activeEmployee) return;
    const { record, isCheckOut } = attendanceService.recordPunch(
      activeEmployee,
      type,
      geofenceStatus,
      distanceMeters,
      selfieSnapshot
    );
    setPunchRecords(attendanceService.getAllPunches());
    if (isCheckOut) {
      showToast(
        `Punch Out recorded! Duty duration: ${record.workHours} hrs.`,
        "success"
      );
    } else {
      showToast(
        `Punch In recorded at ${record.punchInTime}! Status: ${record.status}`,
        "success"
      );
    }
  };

  const applyLeave = (leaveData: any) => {
    if (!activeEmployee) return;
    const req = leaveService.applyLeave(activeEmployee, leaveData);
    setLeaveRequests(leaveService.getLeaveRequests(activeEmployee.id));
    setLeaveBalance(leaveService.getLeaveBalance());
    showToast(`Leave application submitted successfully!`, "success");
  };

  if (!activeEmployee || !leaveBalance) {
    return (
      <div className="min-h-screen bg-[#e8eef5] flex items-center justify-center text-slate-800">
        <div className="flex items-center gap-3 font-sans text-blue-600 font-semibold text-sm">
          <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
          <span>Loading Hazree Portal...</span>
        </div>
      </div>
    );
  }

  const todayPunch = attendanceService.getTodayPunch(activeEmployee.id);

  return (
    <CustomerAppContext.Provider
      value={{
        employees,
        activeEmployee,
        setActiveEmployee,
        punchRecords,
        todayPunch,
        leaveBalance,
        leaveRequests,
        backendOnline,
        toasts,
        showToast,
        removeToast,
        recordPunch,
        applyLeave,
      }}
    >
      {children}
    </CustomerAppContext.Provider>
  );
}

export function useCustomerApp() {
  const context = useContext(CustomerAppContext);
  if (!context) {
    throw new Error("useCustomerApp must be used within a CustomerAppProvider");
  }
  return context;
}
