import { LeaveBalance, LeaveRequest, EmployeeProfile } from "../types/customer";
import { STORAGE_KEYS } from "../config/constants";
import { INITIAL_LEAVE_BALANCE, INITIAL_LEAVE_REQUESTS } from "../lib/mockData";
import { getTodayDateString } from "../lib/utils";

function getStoredLeaves(): LeaveRequest[] {
  if (typeof window === "undefined") return INITIAL_LEAVE_REQUESTS;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.LEAVE_REQUESTS);
    return data ? JSON.parse(data) : INITIAL_LEAVE_REQUESTS;
  } catch {
    return INITIAL_LEAVE_REQUESTS;
  }
}

function getStoredBalance(): LeaveBalance {
  if (typeof window === "undefined") return INITIAL_LEAVE_BALANCE;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.LEAVE_BALANCE);
    return data ? JSON.parse(data) : INITIAL_LEAVE_BALANCE;
  } catch {
    return INITIAL_LEAVE_BALANCE;
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
