import {
  EmployeeProfile,
  PunchRecord,
  LeaveBalance,
  LeaveRequest,
  AttendanceStatus,
  CompanyOnboardingData,
} from "../types/customer";
import {
  INITIAL_EMPLOYEES,
  INITIAL_LEAVE_BALANCE,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_PUNCH_RECORDS,
} from "./mockData";

const BACKEND_BASE_URL = "http://localhost:8000";

// LocalStorage Keys
const STORAGE_KEYS = {
  EMPLOYEES: "hazree_employees_v1",
  CURRENT_USER_ID: "hazree_current_emp_id",
  PUNCH_RECORDS: "hazree_punches_v1",
  LEAVE_REQUESTS: "hazree_leaves_v1",
  LEAVE_BALANCE: "hazree_balance_v1",
  ONBOARDED_COMPANIES: "hazree_companies_v1",
};

// Safe LocalStorage helpers
function getItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.warn(`Error reading key ${key} from storage:`, e);
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Error saving key ${key} to storage:`, e);
  }
}

export const HazreeStorage = {
  getEmployees(): EmployeeProfile[] {
    return getItem<EmployeeProfile[]>(STORAGE_KEYS.EMPLOYEES, INITIAL_EMPLOYEES);
  },

  getCurrentEmployee(): EmployeeProfile {
    const employees = this.getEmployees();
    const currentId = getItem<number>(STORAGE_KEYS.CURRENT_USER_ID, 101);
    return employees.find((e) => e.id === currentId) || employees[0];
  },

  setCurrentEmployeeId(id: number): void {
    setItem(STORAGE_KEYS.CURRENT_USER_ID, id);
  },

  getPunchRecords(): PunchRecord[] {
    return getItem<PunchRecord[]>(STORAGE_KEYS.PUNCH_RECORDS, INITIAL_PUNCH_RECORDS);
  },

  getTodayPunch(employeeId: number): PunchRecord | undefined {
    const today = new Date().toISOString().split("T")[0];
    const records = this.getPunchRecords();
    return records.find((r) => r.employeeId === employeeId && r.date === today);
  },

  recordPunch(
    employee: EmployeeProfile,
    punchType: "Web App" | "Mobile GPS" | "Kiosk PIN" | "Biometric",
    geofenceStatus: "Inside" | "Outside" | "Remote Verified" = "Inside",
    distanceMeters: number = 12,
    selfieSnapshot?: string
  ): { record: PunchRecord; isCheckOut: boolean } {
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const timeStr = now.toTimeString().split(" ")[0]; // "09:30:00"

    const records = this.getPunchRecords();
    const existingIndex = records.findIndex(
      (r) => r.employeeId === employee.id && r.date === today
    );

    if (existingIndex >= 0 && !records[existingIndex].punchOutTime) {
      // Check Out Action
      const existing = records[existingIndex];
      const punchInParts = existing.punchInTime.split(":");
      const punchInDate = new Date();
      punchInDate.setHours(
        parseInt(punchInParts[0]),
        parseInt(punchInParts[1]),
        parseInt(punchInParts[2] || "0")
      );

      const diffMs = Math.max(0, now.getTime() - punchInDate.getTime());
      const hoursWorked = +(diffMs / (1000 * 60 * 60)).toFixed(2);

      const updatedRecord: PunchRecord = {
        ...existing,
        punchOutTime: timeStr,
        workHours: hoursWorked > 0 ? hoursWorked : 0.1,
        status: hoursWorked < 4.5 ? "Half Day" : existing.status,
      };

      records[existingIndex] = updatedRecord;
      setItem(STORAGE_KEYS.PUNCH_RECORDS, records);
      return { record: updatedRecord, isCheckOut: true };
    } else {
      // Punch In Action
      // Determine status based on shift
      const shiftParts = employee.shiftStart.split(":");
      const shiftStartMinutes = parseInt(shiftParts[0]) * 60 + parseInt(shiftParts[1]);
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const isLate = currentMinutes > shiftStartMinutes + 15; // 15 mins grace

      const newRecord: PunchRecord = {
        id: Date.now(),
        employeeId: employee.id,
        employeeName: employee.fullName,
        employeeCode: employee.employeeCode,
        date: today,
        punchInTime: timeStr,
        punchOutTime: null,
        status: isLate ? "Late" : "Present",
        workHours: 0,
        punchLocation: `${employee.companyName} Premises`,
        geofenceStatus,
        distanceMeters,
        selfieSnapshot,
        punchType,
        notes: isLate ? "Late check-in by grace threshold" : "On-time GPS verified punch",
      };

      const newRecords = [newRecord, ...records];
      setItem(STORAGE_KEYS.PUNCH_RECORDS, newRecords);
      return { record: newRecord, isCheckOut: false };
    }
  },

  getLeaveRequests(employeeId?: number): LeaveRequest[] {
    const leaves = getItem<LeaveRequest[]>(
      STORAGE_KEYS.LEAVE_REQUESTS,
      INITIAL_LEAVE_REQUESTS
    );
    if (employeeId) {
      return leaves.filter((l) => l.employeeId === employeeId);
    }
    return leaves;
  },

  applyLeave(
    employee: EmployeeProfile,
    leaveData: {
      leaveType: "Casual" | "Sick" | "Earned" | "Unpaid";
      startDate: string;
      endDate: string;
      daysCount: number;
      isHalfDay: boolean;
      halfDaySession?: "Morning" | "Afternoon";
      reason: string;
    }
  ): LeaveRequest {
    const today = new Date().toISOString().split("T")[0];
    const leaves = this.getLeaveRequests();

    const newLeave: LeaveRequest = {
      id: Date.now(),
      employeeId: employee.id,
      employeeName: employee.fullName,
      appliedOn: today,
      status: "Pending",
      ...leaveData,
    };

    const updated = [newLeave, ...leaves];
    setItem(STORAGE_KEYS.LEAVE_REQUESTS, updated);

    // Deduct balance
    const balance = this.getLeaveBalance();
    if (leaveData.leaveType === "Casual") {
      balance.casual.used += leaveData.daysCount;
      balance.casual.remaining = Math.max(0, balance.casual.total - balance.casual.used);
    } else if (leaveData.leaveType === "Sick") {
      balance.sick.used += leaveData.daysCount;
      balance.sick.remaining = Math.max(0, balance.sick.total - balance.sick.used);
    } else if (leaveData.leaveType === "Earned") {
      balance.earned.used += leaveData.daysCount;
      balance.earned.remaining = Math.max(0, balance.earned.total - balance.earned.used);
    }
    setItem(STORAGE_KEYS.LEAVE_BALANCE, balance);

    return newLeave;
  },

  getLeaveBalance(): LeaveBalance {
    return getItem<LeaveBalance>(STORAGE_KEYS.LEAVE_BALANCE, INITIAL_LEAVE_BALANCE);
  },

  saveOnboardedCompany(data: CompanyOnboardingData): void {
    const companies = getItem<CompanyOnboardingData[]>(
      STORAGE_KEYS.ONBOARDED_COMPANIES,
      []
    );
    setItem(STORAGE_KEYS.ONBOARDED_COMPANIES, [data, ...companies]);
  },
};

// Check if backend is alive
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/health`, {
      method: "GET",
      signal: AbortSignal.timeout(2000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
