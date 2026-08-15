import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AttendanceRecord, AttendanceStatus } from '../../types';
import { mockAttendanceRecords } from '../../lib/mockData';
import {
  attendanceService,
  AttendancePunchPayload,
  AttendanceStatsData,
} from '../../services/attendanceService';

interface AttendanceState {
  records: AttendanceRecord[];
  stats: AttendanceStatsData | null;
  searchQuery: string;
  activeTab: string;
  isLoading: boolean;
  isPunching: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: AttendanceState = {
  records: [],
  stats: null,
  searchQuery: '',
  activeTab: 'ALL',
  isLoading: false,
  isPunching: false,
  error: null,
  successMessage: null,
};

/**
 * Async Thunk to fetch live attendance records from backend
 */
export const fetchAttendanceAsync = createAsyncThunk(
  'attendance/fetchAttendance',
  async (
    params: { date?: string; status?: string; companyId?: number | string } | undefined,
    { rejectWithValue }
  ) => {
    try {
      const data = await attendanceService.getAttendanceLogs(params);
      return data;
    } catch (err: any) {
      if (err?.status !== 401 && err?.status !== 403) {
        console.warn('Backend fetch attendance warning:', err?.message);
      }
      return rejectWithValue(err?.message || 'Failed to fetch attendance logs');
    }
  }
);

/**
 * Async Thunk to submit attendance punch to backend
 */
export const markAttendanceAsync = createAsyncThunk(
  'attendance/markAttendance',
  async (payload: AttendancePunchPayload, { rejectWithValue }) => {
    try {
      const created = await attendanceService.markAttendance(payload);
      return created;
    } catch (err: any) {
      const msg =
        (err.details && typeof err.details === 'object' && (err.details.detail || err.details.message)) ||
        err.message ||
        'Failed to mark attendance';
      return rejectWithValue(msg);
    }
  }
);

/**
 * Async Thunk to fetch attendance stats
 */
export const fetchAttendanceStatsAsync = createAsyncThunk(
  'attendance/fetchStats',
  async (params: { companyId?: number | string; date?: string } | undefined, { rejectWithValue }) => {
    try {
      const data = await attendanceService.getStats(params?.companyId, params?.date);
      return data;
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to fetch stats');
    }
  }
);

/**
 * Async Thunk to delete attendance record
 */
export const deleteAttendanceAsync = createAsyncThunk(
  'attendance/deleteAttendance',
  async (recordId: string, { rejectWithValue }) => {
    try {
      await attendanceService.deleteAttendance(recordId);
      return recordId;
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to delete attendance record');
    }
  }
);

export const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    addAttendanceRecord: (state, action: PayloadAction<AttendanceRecord>) => {
      state.records.unshift(action.payload);
    },
    updateAttendanceStatus: (
      state,
      action: PayloadAction<{ id: string; status: AttendanceStatus }>
    ) => {
      const record = state.records.find((r) => r.id === action.payload.id);
      if (record) {
        record.status = action.payload.status;
      }
    },
    updateAttendanceRecord: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<AttendanceRecord> }>
    ) => {
      const index = state.records.findIndex((r) => r.id === action.payload.id);
      if (index !== -1) {
        state.records[index] = { ...state.records[index], ...action.payload.updates };
      }
    },
    deleteAttendanceRecord: (state, action: PayloadAction<string>) => {
      state.records = state.records.filter((r) => r.id !== action.payload);
    },
    setAttendanceSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setAttendanceActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload;
    },
    clearAttendanceError: (state) => {
      state.error = null;
    },
    clearAttendanceSuccess: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Attendance Logs
      .addCase(fetchAttendanceAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAttendanceAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload && action.payload.length > 0) {
          state.records = action.payload;
        }
      })
      .addCase(fetchAttendanceAsync.rejected, (state, action) => {
        state.isLoading = false;
        // Keep fallback mock data if initial load fails
      })

      // Mark Attendance Punch
      .addCase(markAttendanceAsync.pending, (state) => {
        state.isPunching = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(markAttendanceAsync.fulfilled, (state, action) => {
        state.isPunching = false;
        state.records.unshift(action.payload);
        state.successMessage = `Attendance logged for "${action.payload.employeeName}" (${action.payload.status})`;
      })
      .addCase(markAttendanceAsync.rejected, (state, action) => {
        state.isPunching = false;
        state.error = (action.payload as string) || 'Failed to mark attendance';
      })

      // Fetch Stats
      .addCase(fetchAttendanceStatsAsync.fulfilled, (state, action) => {
        state.stats = action.payload;
      })

      // Delete Attendance
      .addCase(deleteAttendanceAsync.fulfilled, (state, action) => {
        state.records = state.records.filter((r) => r.id !== action.payload);
      });
  },
});

export const {
  addAttendanceRecord,
  updateAttendanceStatus,
  updateAttendanceRecord,
  deleteAttendanceRecord,
  setAttendanceSearchQuery,
  setAttendanceActiveTab,
  clearAttendanceError,
  clearAttendanceSuccess,
} = attendanceSlice.actions;

export default attendanceSlice.reducer;
