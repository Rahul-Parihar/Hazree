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
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  setUser,
  logout,
  initializeAuth,
} from "@/redux/slices/authSlice";
import {
  recordPunchAsync,
  fetchAttendanceAsync,
  initializeAttendance,
} from "@/redux/slices/attendanceSlice";
import {
  applyLeave as applyLeaveRedux,
  initializeLeaves,
} from "@/redux/slices/leavesSlice";
import {
  showToast as showToastRedux,
  removeToast as removeToastRedux,
  ToastNotification,
} from "@/redux/slices/uiSlice";

interface CustomerAppContextType {
  employees: EmployeeProfile[];
  activeEmployee: EmployeeProfile;
  setActiveEmployee: (emp: EmployeeProfile) => void;
  isAuthenticated: boolean;
  loginUser: (profile: EmployeeProfile) => void;
  logoutUser: () => void;
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
  const dispatch = useAppDispatch();
  const reduxAuth = useAppSelector((state) => state.auth);
  const reduxAttendance = useAppSelector((state) => state.attendance);
  const reduxLeaves = useAppSelector((state) => state.leaves);
  const reduxUi = useAppSelector((state) => state.ui);

  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [backendOnline, setBackendOnline] = useState<boolean>(false);

  useEffect(() => {
    const emps = employeeService.getAllEmployees();
    setEmployees(emps);
    dispatch(initializeAuth());
    checkBackendHealth().then((status) => setBackendOnline(status));
  }, [dispatch]);

  useEffect(() => {
    const current = reduxAuth.user || employeeService.getCurrentEmployee();
    if (current) {
      dispatch(initializeAttendance({ employeeId: current.id }));
      dispatch(fetchAttendanceAsync({ employeeId: current.id, employeeCode: current.employeeCode }));
      dispatch(initializeLeaves({ employeeId: current.id }));
    }
  }, [reduxAuth.user, dispatch]);

  const showToast = (
    text: string,
    type: "success" | "info" | "error" = "success"
  ) => {
    dispatch(showToastRedux({ text, type }));
    const id = `${Date.now()}`;
    setTimeout(() => {
      // Auto dismiss oldest toast if needed
    }, 4500);
  };

  const removeToast = (id: string) => {
    dispatch(removeToastRedux(id));
  };

  const activeEmployee = reduxAuth.user || employeeService.getCurrentEmployee();

  const setActiveEmployee = (emp: EmployeeProfile) => {
    dispatch(setUser(emp));
    dispatch(initializeLeaves({ employeeId: emp.id }));
    dispatch(initializeAttendance({ employeeId: emp.id }));
    dispatch(fetchAttendanceAsync({ employeeId: emp.id, employeeCode: emp.employeeCode }));
    showToast(`Switched active profile to ${emp.fullName}`, "info");
  };

  const loginUser = (profile: EmployeeProfile) => {
    dispatch(setUser(profile));
    dispatch(initializeAttendance({ employeeId: profile.id }));
    dispatch(fetchAttendanceAsync({ employeeId: profile.id, employeeCode: profile.employeeCode }));
    dispatch(initializeLeaves({ employeeId: profile.id }));
    showToast(`Welcome ${profile.fullName}! Signed in successfully.`, "success");
  };

  const logoutUser = () => {
    dispatch(logout());
    showToast("Signed out of Hazree portal.", "info");
  };

  const recordPunch = (
    type: "Web App" | "Mobile GPS" | "Kiosk PIN" | "Biometric" = "Web App",
    geofenceStatus: "Inside" | "Outside" | "Remote Verified" = "Inside",
    distanceMeters: number = 12,
    selfieSnapshot?: string
  ) => {
    if (!activeEmployee) return;
    dispatch(
      recordPunchAsync({
        employee: activeEmployee,
        type,
        geofenceStatus,
        distanceMeters,
        selfieSnapshot,
      })
    );
    showToast(
      `Punch event recorded via ${type}! Location: ${geofenceStatus}`,
      "success"
    );
  };

  const applyLeave = (leaveData: any) => {
    if (!activeEmployee) return;
    dispatch(
      applyLeaveRedux({
        employee: activeEmployee,
        leaveData,
      })
    );
    showToast(`Leave application submitted successfully!`, "success");
  };

  const todayPunch = reduxAttendance.todayPunch || attendanceService.getTodayPunch(activeEmployee?.id || 1);

  return (
    <CustomerAppContext.Provider
      value={{
        employees,
        activeEmployee: activeEmployee || employeeService.getCurrentEmployee(),
        setActiveEmployee,
        isAuthenticated: reduxAuth.isAuthenticated,
        loginUser,
        logoutUser,
        punchRecords: reduxAttendance.punches.length > 0 ? reduxAttendance.punches : attendanceService.getAllPunches(),
        todayPunch: todayPunch || undefined,
        leaveBalance: reduxLeaves.balance,
        leaveRequests: reduxLeaves.requests,
        backendOnline,
        toasts: reduxUi.toasts,
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
