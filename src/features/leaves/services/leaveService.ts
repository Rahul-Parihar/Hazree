import { LeaveBalance, LeaveRequest, EmployeeProfile } from "@/types/customer";
import { STORAGE_KEYS } from "@/config/constants";
import { getTodayDateString } from "@/lib/utils";

function getDefaultLeaveBalance(): LeaveBalance {
  return {
    casual: { total: 12, used: 0, remaining: 12 },
    sick: { total: 10, used: 0, remaining: 10 },
    earned: { total: 15, used: 0, remaining: 15 },
    unpaid: { used: 0 },
  };
}

function getStoredLeaves(): LeaveRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.LEAVE_REQUESTS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function getStoredBalance(): LeaveBalance {
  if (typeof window === "undefined") return getDefaultLeaveBalance();
  try {
    const data = localStorage.getItem(STORAGE_KEYS.LEAVE_BALANCE);
    if (data) {
      const parsed = JSON.parse(data);
      return {
        casual: { total: 12, used: 0, remaining: 12, ...(parsed.casual || {}) },
        sick: { total: 10, used: 0, remaining: 10, ...(parsed.sick || {}) },
        earned: { total: 15, used: 0, remaining: 15, ...(parsed.earned || {}) },
        unpaid: { used: 0, ...(parsed.unpaid || {}) },
      };
    }
    return getDefaultLeaveBalance();
  } catch {
    return getDefaultLeaveBalance();
  }
}

export interface CompanyLeaveType {
  id: number;
  company_id: number;
  name: string;
  quota: number;
  remaining_quota?: number;
  is_paid: boolean;
}

export interface LeaveEntry {
  id: string;
  employeeName: string;
  role: string;
  isYou: boolean;
  leaveDate: string;
  duration: string;
  durationBadge?: string;
  status: "Pending" | "Approved" | "Rejected";
  leaveType: string;
  leaveSubType?: string;
  isPaid: boolean;
}

export const leaveService = {
  async getCompanyLeaveTypes(
    companyId?: number | string,
    employeeId?: number | string
  ): Promise<CompanyLeaveType[]> {
    try {
      const compId = companyId ? Number(String(companyId).replace("cmp_", "")) : 1;
      const empId = employeeId ? Number(String(employeeId).replace("emp_", "")) : undefined;
      const params = new URLSearchParams({ company_id: String(compId) });
      if (empId) params.append("employee_id", String(empId));

      const url = `http://localhost:8000/leaves/types?${params.toString()}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          return data;
        }
      }
    } catch (e) {
      console.warn("Failed to fetch live leave types:", e);
    }
    return [];
  },

  async syncBackendLeaves(
    employeeId?: number | string,
    companyId?: number | string
  ): Promise<LeaveEntry[]> {
    try {
      const compId = companyId ? Number(String(companyId).replace("cmp_", "")) : 1;
      const empId = employeeId ? Number(String(employeeId).replace("emp_", "")) : undefined;

      const params = new URLSearchParams();
      if (compId) params.append("company_id", String(compId));
      if (empId) params.append("employee_id", String(empId));

      const res = await fetch(`http://localhost:8000/leaves/?${params.toString()}`, {
        signal: AbortSignal.timeout(4000),
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          return data.map((b: any): LeaveEntry => {
            let dateFormatted = b.start_date || "";
            try {
              const dt = new Date(b.start_date);
              if (!isNaN(dt.getTime())) {
                const dayName = dt.toLocaleDateString("en-US", { weekday: "long" });
                dateFormatted = `${b.start_date} (${dayName})`;
              }
            } catch {}

            const durationStr = b.days_count > 1 ? "Multiple" : "Full Day";
            const durationBadge = b.days_count > 1 ? `${b.days_count} Days` : undefined;

            return {
              id: String(b.id),
              employeeName: b.employee_name || "Employee",
              role: b.department || "Staff",
              isYou: true,
              leaveDate: dateFormatted,
              duration: durationStr,
              durationBadge: durationBadge,
              status: (b.status as any) || "Pending",
              leaveType: b.leave_type || "Casual",
              isPaid: b.is_paid !== undefined ? Boolean(b.is_paid) : true,
            };
          });
        }
      }
    } catch (e) {
      console.warn("Failed to fetch live backend leaves:", e);
    }
    return [];
  },

  async submitBackendLeave(payload: {
    employeeId?: number | string;
    employeeName: string;
    department: string;
    companyId?: number | string;
    leaveType: string;
    startDate: string;
    endDate: string;
    daysCount: number;
    reason: string;
  }): Promise<LeaveEntry | null> {
    try {
      const compId = payload.companyId
        ? Number(String(payload.companyId).replace("cmp_", ""))
        : 1;
      const empId = payload.employeeId
        ? Number(String(payload.employeeId).replace("emp_", ""))
        : 1;

      const res = await fetch(`http://localhost:8000/leaves/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_id: empId,
          employee_name: payload.employeeName,
          department: payload.department,
          company_id: compId,
          leave_type: payload.leaveType,
          start_date: payload.startDate,
          end_date: payload.endDate,
          days_count: payload.daysCount || 1,
          reason: payload.reason || "Time off request",
          status: "Pending",
        }),
      });

      if (res.ok) {
        const b = await res.json();
        let dateFormatted = b.start_date || "";
        try {
          const dt = new Date(b.start_date);
          if (!isNaN(dt.getTime())) {
            const dayName = dt.toLocaleDateString("en-US", { weekday: "long" });
            dateFormatted = `${b.start_date} (${dayName})`;
          }
        } catch {}

        return {
          id: String(b.id),
          employeeName: b.employee_name || payload.employeeName,
          role: b.department || payload.department,
          isYou: true,
          leaveDate: dateFormatted,
          duration: b.days_count > 1 ? "Multiple" : "Full Day",
          durationBadge: b.days_count > 1 ? `${b.days_count} Days` : undefined,
          status: "Pending",
          leaveType: b.leave_type || payload.leaveType,
          isPaid: b.is_paid !== undefined ? Boolean(b.is_paid) : true,
        };
      }
    } catch (e) {
      console.warn("Failed to submit backend leave:", e);
    }
    return null;
  },

  getLeaveRequests(employeeId?: number): LeaveRequest[] {
    const leaves = getStoredLeaves();
    return employeeId ? leaves.filter((l) => l.employeeId === employeeId) : leaves;
  },

  getLeaveBalance(): LeaveBalance {
    return getStoredBalance();
  },

  applyLeave(
    employee: EmployeeProfile,
    leaveData: {
      leaveType: "Casual" | "Sick" | "Earned" | "Unpaid" | string;
      startDate: string;
      endDate: string;
      daysCount: number;
      isHalfDay: boolean;
      halfDaySession?: "Morning" | "Afternoon";
      reason: string;
    }
  ): LeaveRequest {
    const today = getTodayDateString();
    const leaves = getStoredLeaves();

    const newRequest: LeaveRequest = {
      id: Date.now(),
      employeeId: employee.id,
      employeeName: employee.fullName,
      appliedOn: today,
      status: "Pending",
      ...leaveData,
    } as any;

    const updatedLeaves = [newRequest, ...leaves];
    try {
      localStorage.setItem(STORAGE_KEYS.LEAVE_REQUESTS, JSON.stringify(updatedLeaves));
    } catch {}

    // Update balances safely
    const stored = getStoredBalance();
    const balance: LeaveBalance = {
      casual: { ...stored.casual },
      sick: { ...stored.sick },
      earned: { ...stored.earned },
      unpaid: { ...stored.unpaid },
    };

    const typeLower = (leaveData.leaveType || "").toLowerCase();
    const days = leaveData.daysCount || 1;

    if (typeLower.includes("casual")) {
      balance.casual.used = (balance.casual.used || 0) + days;
      balance.casual.remaining = Math.max(0, balance.casual.total - balance.casual.used);
    } else if (typeLower.includes("sick")) {
      balance.sick.used = (balance.sick.used || 0) + days;
      balance.sick.remaining = Math.max(0, balance.sick.total - balance.sick.used);
    } else if (typeLower.includes("earned")) {
      balance.earned.used = (balance.earned.used || 0) + days;
      balance.earned.remaining = Math.max(0, balance.earned.total - balance.earned.used);
    } else {
      balance.unpaid.used = (balance.unpaid.used || 0) + days;
    }

    try {
      localStorage.setItem(STORAGE_KEYS.LEAVE_BALANCE, JSON.stringify(balance));
    } catch {}

    return newRequest;
  },
};
