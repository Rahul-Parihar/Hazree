import { LeaveBalance, LeaveRequest, EmployeeProfile } from "@/types/customer";
import { STORAGE_KEYS } from "@/config/constants";
import { getTodayDateString } from "@/lib/utils";

const DEFAULT_LEAVE_BALANCE: LeaveBalance = {
  casual: { total: 12, used: 0, remaining: 12 },
  sick: { total: 10, used: 0, remaining: 10 },
  earned: { total: 15, used: 0, remaining: 15 },
  unpaid: { used: 0 },
};

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
  if (typeof window === "undefined") return DEFAULT_LEAVE_BALANCE;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.LEAVE_BALANCE);
    return data ? JSON.parse(data) : DEFAULT_LEAVE_BALANCE;
  } catch {
    return DEFAULT_LEAVE_BALANCE;
  }
}

export const leaveService = {
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
      leaveType: "Casual" | "Sick" | "Earned" | "Unpaid";
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
    };

    const updatedLeaves = [newRequest, ...leaves];
    try {
      localStorage.setItem(STORAGE_KEYS.LEAVE_REQUESTS, JSON.stringify(updatedLeaves));
    } catch {}

    // Update balances
    const balance = getStoredBalance();
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

    try {
      localStorage.setItem(STORAGE_KEYS.LEAVE_BALANCE, JSON.stringify(balance));
    } catch {}

    return newRequest;
  },
};
