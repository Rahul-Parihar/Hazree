import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AttendanceRecord, AttendanceStatus } from '../../types';
import { mockAttendanceRecords } from '../../lib/mockData';

interface AttendanceState {
  records: AttendanceRecord[];
  searchQuery: string;
  activeTab: string;
}

const initialState: AttendanceState = {
  records: mockAttendanceRecords,
  searchQuery: '',
  activeTab: 'ALL',
};

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
  },
});

export const {
  addAttendanceRecord,
  updateAttendanceStatus,
  updateAttendanceRecord,
  deleteAttendanceRecord,
  setAttendanceSearchQuery,
  setAttendanceActiveTab,
} = attendanceSlice.actions;

export default attendanceSlice.reducer;
