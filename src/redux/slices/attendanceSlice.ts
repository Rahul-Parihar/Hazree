import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { PunchRecord, EmployeeProfile, ShiftDay } from "@/types/customer";
import { attendanceService } from "@/features/attendance/services/attendanceService";
import { INITIAL_SHIFTS } from "@/lib/mockData";
import { getTodayDateString } from "@/lib/utils";

export interface AttendanceState {
  punches: PunchRecord[];
  todayPunch: PunchRecord | null;
  shifts: ShiftDay[];
  isClockedIn: boolean;
  clockInTime: string | null;
  elapsedSeconds: number;
  isLoading: boolean;
}

const initialState: AttendanceState = {
  punches: [],
  todayPunch: null,
  shifts: INITIAL_SHIFTS,
  isClockedIn: false,
  clockInTime: null,
  elapsedSeconds: 0,
  isLoading: false,
};

/**
 * Async Thunk to fetch and sync live attendance punches from backend
 */
export const fetchAttendanceAsync = createAsyncThunk(
  "attendance/fetchAttendance",
  async ({
    employeeId,
    employeeCode,
  }: {
    employeeId: number;
    employeeCode?: string;
  }) => {
    const livePunches = await attendanceService.syncBackendPunches(
      employeeId,
      employeeCode
    );
    return { livePunches, employeeId };
  }
);

/**
 * Async Thunk to record live punch to backend & local cache
 */
export const recordPunchAsync = createAsyncThunk(
  "attendance/recordPunchAsync",
  async (
    {
      employee,
      type = "Web App",
      geofenceStatus = "Inside",
      distanceMeters = 10,
      selfieSnapshot,
    }: {
      employee: EmployeeProfile;
      type?: "Web App" | "Mobile GPS" | "Kiosk PIN" | "Biometric";
      geofenceStatus?: "Inside" | "Outside" | "Remote Verified";
      distanceMeters?: number;
      selfieSnapshot?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const result = await attendanceService.recordPunch(
        employee,
        type,
        geofenceStatus,
        distanceMeters,
        selfieSnapshot
      );
      return result;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to record punch");
    }
  }
);

export const attendanceSlice = createSlice({
  name: "attendance",
  initialState,
  reducers: {
    initializeAttendance: (
      state,
      action: PayloadAction<{ employeeId?: number | string }>
    ) => {
      const allPunches = attendanceService.getAllPunches();
      state.punches = allPunches;
      if (action.payload.employeeId) {
        const empId =
          typeof action.payload.employeeId === "string"
            ? parseInt(action.payload.employeeId, 10)
            : action.payload.employeeId;
        const today = attendanceService.getTodayPunch(empId);
        state.todayPunch = today || null;
        if (today && !today.punchOutTime) {
          state.isClockedIn = true;
          state.clockInTime = today.punchInTime;
        } else {
          state.isClockedIn = false;
        }
      }
    },
    handleRealtimePunch: (
      state,
      action: PayloadAction<{ punch: PunchRecord; targetEmployeeId?: number | string; targetEmployeeName?: string }>
    ) => {
      const { punch, targetEmployeeId, targetEmployeeName } = action.payload;
      const today = getTodayDateString();
      const todayAlt = today.split("-").reverse().join("/");

      // Check if punch matches current active employee
      const rawTargetId = targetEmployeeId ? Number(String(targetEmployeeId).replace("emp_", "")) : undefined;
      const rawPunchEmpId = Number(String(punch.employeeId).replace("emp_", ""));
      const isMyPunch =
        (rawTargetId !== undefined && (rawPunchEmpId === rawTargetId || punch.employeeId === targetEmployeeId)) ||
        (targetEmployeeName && punch.employeeName && targetEmployeeName.toLowerCase() === punch.employeeName.toLowerCase());

      // Update in punches array
      const existingIdx = state.punches.findIndex(
        (p) =>
          Number(String(p.employeeId).replace("emp_", "")) === rawPunchEmpId &&
          (p.date === punch.date || p.date === today || p.date === todayAlt)
      );
      if (existingIdx !== -1) {
        state.punches[existingIdx] = { ...state.punches[existingIdx], ...punch };
      } else {
        state.punches.unshift(punch);
      }

      // If matches active employee, update todayPunch and isClockedIn
      if (isMyPunch && (punch.date === today || punch.date === todayAlt || !punch.date)) {
        state.todayPunch = punch;
        if (punch.punchOutTime && punch.punchOutTime !== "--") {
          state.isClockedIn = false;
          state.clockInTime = null;
          state.elapsedSeconds = 0;
        } else if (punch.punchInTime && punch.punchInTime !== "--") {
          state.isClockedIn = true;
          state.clockInTime = punch.punchInTime;
        }
      }
    },
    incrementElapsedSeconds: (state) => {
      if (state.isClockedIn) {
        state.elapsedSeconds += 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Live Punches
      .addCase(fetchAttendanceAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAttendanceAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.punches = action.payload.livePunches;
        const today = getTodayDateString();
        const todayAlt = today.split("-").reverse().join("/");
        const targetEmpId = Number(String(action.payload.employeeId).replace("emp_", ""));
        
        const todayRecord =
          action.payload.livePunches.find(
            (p) =>
              Number(String(p.employeeId).replace("emp_", "")) === targetEmpId &&
              (p.date === today || p.date === todayAlt)
          ) || null;

        state.todayPunch = todayRecord || null;
        if (todayRecord && !todayRecord.punchOutTime) {
          state.isClockedIn = true;
          state.clockInTime = todayRecord.punchInTime;
        } else {
          state.isClockedIn = false;
          state.clockInTime = null;
        }
      })
      .addCase(fetchAttendanceAsync.rejected, (state) => {
        state.isLoading = false;
      })
      // Record Live Punch
      .addCase(recordPunchAsync.fulfilled, (state, action) => {
        const { record, isCheckOut } = action.payload;
        state.todayPunch = record;
        state.punches = attendanceService.getAllPunches();
        if (isCheckOut) {
          state.isClockedIn = false;
          state.clockInTime = null;
          state.elapsedSeconds = 0;
        } else {
          state.isClockedIn = true;
          state.clockInTime = record.punchInTime;
          state.elapsedSeconds = 0;
        }
      });
  },
});

export const {
  initializeAttendance,
  handleRealtimePunch,
  incrementElapsedSeconds,
} = attendanceSlice.actions;

export default attendanceSlice.reducer;
