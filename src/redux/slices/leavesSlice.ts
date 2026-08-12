import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LeaveRequest, LeaveStatus } from '../../types';
import { mockLeaveRequests } from '../../lib/mockData';

interface LeavesState {
  leaves: LeaveRequest[];
  statusFilter: string;
}

const initialState: LeavesState = {
  leaves: mockLeaveRequests,
  statusFilter: 'ALL',
};

export const leavesSlice = createSlice({
  name: 'leaves',
  initialState,
  reducers: {
    addLeaveRequest: (state, action: PayloadAction<LeaveRequest>) => {
      state.leaves.unshift(action.payload);
    },
    updateLeaveStatus: (
      state,
      action: PayloadAction<{ id: string; status: LeaveStatus }>
    ) => {
      const leave = state.leaves.find((l) => l.id === action.payload.id);
      if (leave) {
        leave.status = action.payload.status;
      }
    },
    deleteLeaveRequest: (state, action: PayloadAction<string>) => {
      state.leaves = state.leaves.filter((l) => l.id !== action.payload);
    },
    setLeavesStatusFilter: (state, action: PayloadAction<string>) => {
      state.statusFilter = action.payload;
    },
  },
});

export const {
  addLeaveRequest,
  updateLeaveStatus,
  deleteLeaveRequest,
  setLeavesStatusFilter,
} = leavesSlice.actions;

export default leavesSlice.reducer;
