import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LeaveBalance, LeaveRequest, EmployeeProfile } from "@/types/customer";
import { leaveService } from "@/features/leaves/services/leaveService";

const getInitialLeaveBalance = (): LeaveBalance => ({
  casual: { total: 12, used: 0, remaining: 12 },
  sick: { total: 10, used: 0, remaining: 10 },
  earned: { total: 15, used: 0, remaining: 15 },
  unpaid: { used: 0 },
});

export interface LeavesState {
  balance: LeaveBalance;
  requests: LeaveRequest[];
}

const initialState: LeavesState = {
  balance: getInitialLeaveBalance(),
  requests: [],
};

export const leavesSlice = createSlice({
  name: "leaves",
  initialState,
  reducers: {
    initializeLeaves: (
      state,
      action: PayloadAction<{ employeeId?: number | string }>
    ) => {
      state.balance = leaveService.getLeaveBalance();
      if (action.payload.employeeId) {
        const empId = typeof action.payload.employeeId === "string" ? parseInt(action.payload.employeeId, 10) : action.payload.employeeId;
        state.requests = leaveService.getLeaveRequests(empId);
      }
    },
    applyLeave: (
      state,
      action: PayloadAction<{
        employee: EmployeeProfile;
        leaveData: any;
      }>
    ) => {
      const { employee, leaveData } = action.payload;
      leaveService.applyLeave(employee, leaveData);
      state.balance = leaveService.getLeaveBalance();
      state.requests = leaveService.getLeaveRequests(employee.id);
    },
  },
});

export const { initializeLeaves, applyLeave } = leavesSlice.actions;

export default leavesSlice.reducer;
