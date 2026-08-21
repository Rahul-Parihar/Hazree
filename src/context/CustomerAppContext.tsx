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
import { wsService } from "../services/websocketService";
import {
  recordPunchAsync,
  fetchAttendanceAsync,
  initializeAttendance,
  handleRealtimePunch,
} from "@/redux/slices/attendanceSlice";

function mapBackendAttendanceToPunchRecord(be: any, employeeCode: string = "EMP-0001"): PunchRecord {
  const isCheckedOut = be.check_out_time && be.check_out_time !== "--";
  return {
    id: be.id,
    employeeId: be.employee_id || 1,
    employeeName: be.employee_name,
    employeeCode: employeeCode,
    date: be.date,
    punchInTime: be.check_in_time,
    punchOutTime: isCheckedOut ? be.check_out_time : null,
    status: be.status || "Present",
    workHours: isCheckedOut ? 8.5 : 0,
    punchLocation: be.location || "Office Premises (Verified)",
    geofenceStatus: "Inside",
    distanceMeters: 10,
    punchType: be.device || "Web App",
  };
}
import {
  applyLeave as applyLeaveRedux,
  initializeLeaves,
} from "@/redux/slices/leavesSlice";
import {
  showToast as showToastRedux,
  removeToast as removeToastRedux,
  ToastNotification,
} from "@/redux/slices/uiSlice";
import { toast } from "sonner";

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

  const activeEmployee = reduxAuth.user || employeeService.getCurrentEmployee();
  const activeEmployeeRef = React.useRef(activeEmployee);
  activeEmployeeRef.current = activeEmployee;

  useEffect(() => {
    const current = reduxAuth.user || employeeService.getCurrentEmployee();
    if (current) {
      dispatch(initializeAttendance({ employeeId: current.id }));
      dispatch(fetchAttendanceAsync({ employeeId: current.id, employeeCode: current.employeeCode }));
      dispatch(initializeLeaves({ employeeId: current.id }));
      wsService.connect(current.companyId, current.id);

      // Periodic auto-sync to ensure auto-close shift updates are reflected immediately
      const syncInterval = setInterval(() => {
        dispatch(fetchAttendanceAsync({ employeeId: current.id, employeeCode: current.employeeCode }));
      }, 30000);

      return () => {
        clearInterval(syncInterval);
      };
    }
  }, [reduxAuth.user, dispatch]);

  useEffect(() => {
    wsService.connect(activeEmployee?.companyId, activeEmployee?.id);

    const unsubscribe = wsService.subscribe((msg: any) => {
      if (!msg || !msg.event) return;

      if (msg.event === "ATTENDANCE_PUNCH" || msg.event === "ATTENDANCE_UPDATE") {
        if (msg.data) {
          const currentEmp = activeEmployeeRef.current;
          const empCode = currentEmp?.employeeCode || "EMP-0001";
          const punchRec = mapBackendAttendanceToPunchRecord(msg.data, empCode);

          dispatch(
            handleRealtimePunch({
              punch: punchRec,
              targetEmployeeId: currentEmp?.id,
              targetEmployeeName: currentEmp?.fullName,
            })
          );

          // Check if it's for current user
          const rawTargetId = currentEmp?.id ? Number(String(currentEmp.id).replace("emp_", "")) : undefined;
          const rawPunchEmpId = Number(String(msg.employee_id || msg.data.employee_id).replace("emp_", ""));
          const isForMe =
            (rawTargetId !== undefined && rawPunchEmpId === rawTargetId) ||
            (currentEmp?.fullName && (
              (msg.employee_name && currentEmp.fullName.toLowerCase().trim() === msg.employee_name.toLowerCase().trim()) ||
              (msg.data.employee_name && currentEmp.fullName.toLowerCase().trim() === msg.data.employee_name.toLowerCase().trim())
            ));

          if (isForMe) {
            const isOut = Boolean(msg.action === "CLOCK_OUT" || (msg.data.check_out_time && msg.data.check_out_time !== "--"));
            const timeStr = isOut ? (msg.data.check_out_time || "") : (msg.data.check_in_time || "");
            toast.success(
              isOut
                ? `Real-Time Sync: Clock Out recorded at ${timeStr}!`
                : `Real-Time Sync: Clock In recorded at ${timeStr}!`,
              { id: `rt_punch_${msg.data.id || Date.now()}`, duration: 3000 }
            );
          }
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [dispatch]);

  const showToast = (
    text: string,
    type: "success" | "info" | "error" = "success"
  ) => {
    dispatch(showToastRedux({ text, type }));
    if (type === "success") {
      toast.success(text);
    } else if (type === "error") {
      toast.error(text);
    } else {
      toast.info(text);
    }
  };

  const removeToast = (id: string) => {
    dispatch(removeToastRedux(id));
  };

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

  const recordPunch = async (
    type: "Web App" | "Mobile GPS" | "Kiosk PIN" | "Biometric" = "Web App",
    geofenceStatus: "Inside" | "Outside" | "Remote Verified" = "Inside",
    distanceMeters: number = 12,
    selfieSnapshot?: string
  ) => {
    if (!activeEmployee) return;
    const res = await dispatch(
      recordPunchAsync({
        employee: activeEmployee,
        type,
        geofenceStatus,
        distanceMeters,
        selfieSnapshot,
      })
    );
    if (recordPunchAsync.fulfilled.match(res)) {
      showToast(
        `Punch event recorded via ${type}! Location: ${geofenceStatus}`,
        "success"
      );
    } else if (recordPunchAsync.rejected.match(res)) {
      showToast((res.payload as string) || "Failed to record punch: Outside shift window", "error");
    }
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
