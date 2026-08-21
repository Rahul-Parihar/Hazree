import { PunchRecord, EmployeeProfile, AttendanceStatus } from "../types/customer";
import { STORAGE_KEYS } from "../config/constants";
import { getTodayDateString } from "../lib/utils";

function getStoredPunches(): PunchRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PUNCH_RECORDS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function savePunches(punches: PunchRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.PUNCH_RECORDS, JSON.stringify(punches));
  } catch (e) {
    console.error("Error saving punches:", e);
  }
}

export const attendanceService = {
  getAllPunches(): PunchRecord[] {
    return getStoredPunches();
  },

  getEmployeePunches(employeeId: number): PunchRecord[] {
    return getStoredPunches().filter((p) => p.employeeId === employeeId);
  },

  getTodayPunch(employeeId: number): PunchRecord | undefined {
    const today = getTodayDateString();
    return getStoredPunches().find(
      (p) => p.employeeId === employeeId && p.date === today
    );
  },

  recordPunch(
    employee: EmployeeProfile,
    punchType: "Web App" | "Mobile GPS" | "Kiosk PIN" | "Biometric" = "Web App",
    geofenceStatus: "Inside" | "Outside" | "Remote Verified" = "Inside",
    distanceMeters: number = 12,
    selfieSnapshot?: string
  ): { record: PunchRecord; isCheckOut: boolean } {
    const now = new Date();
    const today = getTodayDateString();
    const timeStr = now.toTimeString().split(" ")[0];

    const punches = getStoredPunches();
    const existingIndex = punches.findIndex(
      (p) => p.employeeId === employee.id && p.date === today
    );

    if (existingIndex >= 0 && !punches[existingIndex].punchOutTime) {
      // Check-out logic
      const existing = punches[existingIndex];
      const parts = existing.punchInTime.split(":");
      const punchInDate = new Date();
      punchInDate.setHours(
        parseInt(parts[0], 10),
        parseInt(parts[1], 10),
        parseInt(parts[2] || "0", 10)
      );

      const diffMs = Math.max(0, now.getTime() - punchInDate.getTime());
      const hoursWorked = +(diffMs / (1000 * 60 * 60)).toFixed(2);

      const updatedRecord: PunchRecord = {
        ...existing,
        punchOutTime: timeStr,
        workHours: hoursWorked > 0 ? hoursWorked : 0.1,
        status: hoursWorked < 4.5 ? "Half Day" : existing.status,
      };

      punches[existingIndex] = updatedRecord;
      savePunches(punches);
      return { record: updatedRecord, isCheckOut: true };
    } else {
      // Punch-in logic with shift window check
      const parseMins = (t: string) => {
        const m = t.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
        if (!m) return 0;
        let h = parseInt(m[1], 10);
        const min = parseInt(m[2], 10);
        const ap = m[3] ? m[3].toUpperCase() : "";
        if (ap === "PM" && h !== 12) h += 12;
        if (ap === "AM" && h === 12) h = 0;
        return h * 60 + min;
      };

      const sMins = employee.shiftStart ? parseMins(employee.shiftStart) : 540;
      const eMins = employee.shiftEnd ? parseMins(employee.shiftEnd) : 1080;
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      // Check shift window
      if (employee.shiftStart && employee.shiftEnd) {
        if (sMins < eMins) {
          if (currentMinutes < sMins - 45 || currentMinutes > eMins) {
            throw new Error(`Outside shift window. Your shift is active from ${employee.shiftStart} to ${employee.shiftEnd}.`);
          }
        } else {
          const isAllowed = currentMinutes >= (sMins - 45 + 1440) % 1440 || currentMinutes <= eMins;
          if (!isAllowed) {
            throw new Error(`Outside shift window. Your shift is active from ${employee.shiftStart} to ${employee.shiftEnd}.`);
          }
        }
      }

      const isLate = currentMinutes > sMins + 15;

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

      const updated = [newRecord, ...punches];
      savePunches(updated);
      return { record: newRecord, isCheckOut: false };
    }
  },
};
