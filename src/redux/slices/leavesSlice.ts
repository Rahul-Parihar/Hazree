import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { LeaveRequest, LeaveStatus } from '../../types';
import { mockLeaveRequests } from '../../lib/mockData';
import {
  leavesService,
  CreateLeavePayload,
} from '../../services/leavesService';

interface LeavesState {
  leaves: LeaveRequest[];
  statusFilter: string;
  isLoading: boolean;
  isUpdating: boolean;
  isCreating: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: LeavesState = {
  leaves: [],
  statusFilter: 'ALL',
  isLoading: false,
  isUpdating: false,
  isCreating: false,
  error: null,
  successMessage: null,
};

/**
 * Async Thunk to fetch leave requests from backend
 */
export const fetchLeavesAsync = createAsyncThunk(
  'leaves/fetchLeaves',
  async (
    params: { companyId?: number | string; status?: string } | undefined,
    { rejectWithValue }
  ) => {
    try {
      const data = await leavesService.getLeaveRequests(params);
      return data;
    } catch (err: any) {
      if (err?.status !== 401 && err?.status !== 403) {
        console.warn('Backend fetch leaves warning:', err?.message);
      }
      return rejectWithValue(err?.message || 'Failed to fetch leave requests');
    }
  }
);

/**
 * Async Thunk to update leave request status (Approve / Reject)
 */
export const updateLeaveStatusAsync = createAsyncThunk(
  'leaves/updateStatus',
  async (
    { id, status, adminNotes }: { id: string; status: LeaveStatus; adminNotes?: string },
    { rejectWithValue }
  ) => {
    try {
      const updated = await leavesService.updateLeaveStatus(id, status, adminNotes);
      return updated;
    } catch (err: any) {
      const msg =
        (err.details && typeof err.details === 'object' && (err.details.detail || err.details.message)) ||
        err.message ||
        'Failed to update leave status';
      return rejectWithValue(msg);
    }
  }
);

/**
 * Async Thunk to create a new leave application
 */
export const createLeaveAsync = createAsyncThunk(
  'leaves/createLeave',
  async (payload: CreateLeavePayload, { rejectWithValue }) => {
    try {
      const created = await leavesService.createLeaveRequest(payload);
      return created;
    } catch (err: any) {
      const msg =
        (err.details && typeof err.details === 'object' && (err.details.detail || err.details.message)) ||
        err.message ||
        'Failed to submit leave request';
      return rejectWithValue(msg);
    }
  }
);

/**
 * Async Thunk to delete leave request
 */
export const deleteLeaveAsync = createAsyncThunk(
  'leaves/deleteLeave',
  async (leaveId: string, { rejectWithValue }) => {
    try {
      await leavesService.deleteLeaveRequest(leaveId);
      return leaveId;
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to delete leave request');
    }
  }
);

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
    clearLeaveError: (state) => {
      state.error = null;
    },
    clearLeaveSuccess: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Leaves
      .addCase(fetchLeavesAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLeavesAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload && action.payload.length > 0) {
          state.leaves = action.payload;
        }
      })
      .addCase(fetchLeavesAsync.rejected, (state, action) => {
        state.isLoading = false;
      })

      // Update Leave Status
      .addCase(updateLeaveStatusAsync.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateLeaveStatusAsync.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.leaves.findIndex((l) => l.id === action.payload.id);
        if (index !== -1) {
          state.leaves[index] = action.payload;
        }
        state.successMessage = `Leave for "${action.payload.employeeName}" marked as ${action.payload.status}!`;
      })
      .addCase(updateLeaveStatusAsync.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = (action.payload as string) || 'Failed to update leave status';
      })

      // Create Leave
      .addCase(createLeaveAsync.pending, (state) => {
        state.isCreating = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createLeaveAsync.fulfilled, (state, action) => {
        state.isCreating = false;
        state.leaves.unshift(action.payload);
        state.successMessage = `Leave application for "${action.payload.employeeName}" submitted successfully!`;
      })
      .addCase(createLeaveAsync.rejected, (state, action) => {
        state.isCreating = false;
        state.error = (action.payload as string) || 'Failed to submit leave';
      })

      // Delete Leave
      .addCase(deleteLeaveAsync.fulfilled, (state, action) => {
        state.leaves = state.leaves.filter((l) => l.id !== action.payload);
      });
  },
});

export const {
  addLeaveRequest,
  updateLeaveStatus,
  deleteLeaveRequest,
  setLeavesStatusFilter,
  clearLeaveError,
  clearLeaveSuccess,
} = leavesSlice.actions;

export default leavesSlice.reducer;
