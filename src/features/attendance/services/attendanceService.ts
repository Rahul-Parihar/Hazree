import { PunchRecord, EmployeeProfile, AttendanceStatus } from "@/types/customer";
import { STORAGE_KEYS } from "@/config/constants";
import { INITIAL_PUNCH_RECORDS } from "@/lib/mockData";
import { getTodayDateString } from "@/lib/utils";

const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getStoredPunches(): PunchRecord[] {
  if (typeof window === "undefined") return INITIAL_PUNCH_RECORDS;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PUNCH_RECORDS);
    return data ? JSON.parse(data) : INITIAL_PUNCH_RECORDS;
  } catch {
    return INITIAL_PUNCH_RECORDS;
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

function mapBackendAttendanceToPunch(
  be: any,
  employeeCode: string = "EMP-0001"
): PunchRecord {
  const isCheckedOut = be.check_out_time && be.check_out_time !== "--";
  return {
    id: be.id,
    employeeId: be.employee_id || 1,
    employeeName: be.employee_name,
    employeeCode: employeeCode,
    date: be.date,
    punchInTime: be.check_in_time,
    punchOutTime: isCheckedOut ? be.check_out_time : null,
    status: (be.status as AttendanceStatus) || "Present",
    workHours: isCheckedOut ? 8.5 : 0,
    punchLocation: be.location || "Office Premises (Verified)",
    geofenceStatus: "Inside",
    distanceMeters: 10,
    punchType: (be.device as any) || "Web App",
  };
}

export const attendanceService = {
  getAllPunches(): PunchRecord[] {
    return getStoredPunches();
  },

  getEmployeePunches(employeeId: number | string): PunchRecord[] {
    const targetId = Number(String(employeeId).replace("emp_", ""));
    return getStoredPunches().filter((p) => Number(String(p.employeeId).replace("emp_", "")) === targetId);
  },

  getTodayPunch(employeeId: number | string): PunchRecord | undefined {
    const today = getTodayDateString();
    const todayAlt = today.split("-").reverse().join("/");
    const targetId = Number(String(employeeId).replace("emp_", ""));
    return getStoredPunches().find(
      (p) =>
        Number(String(p.employeeId).replace("emp_", "")) === targetId &&
        (p.date === today || p.date === todayAlt)
    );
  },

  /**
   * Fetch live attendance records from FastAPI backend
   */
  async syncBackendPunches(
    employeeId: number,
    employeeCode: string = "EMP-0001"
  ): Promise<PunchRecord[]> {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("hazree_auth_token")
          : null;

      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(
        `${BACKEND_BASE_URL}/attendance/?employee_id=${employeeId}`,
        {
          headers,
        }
      );

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const mapped = data.map((item) =>
            mapBackendAttendanceToPunch(item, employeeCode)
          );
          
          // Merge with stored punches for other dates
          const currentStored = getStoredPunches();
          const otherPunches = currentStored.filter((p) => p.employeeId !== employeeId);
          const combined = [...mapped, ...otherPunches];
          savePunches(combined);
          return mapped;
        }
      }
    } catch (err) {
      console.warn("Backend attendance sync offline, using cached records:", err);
    }
    return this.getEmployeePunches(employeeId);
  },

  /**
   * Submit Clock In / Clock Out punch to backend & local cache
   */
  async recordPunch(
    employee: EmployeeProfile,
    punchType: "Web App" | "Mobile GPS" | "Kiosk PIN" | "Biometric" = "Web App",
    geofenceStatus: "Inside" | "Outside" | "Remote Verified" = "Inside",
    distanceMeters: number = 12,
    selfieSnapshot?: string
  ): Promise<{ record: PunchRecord; isCheckOut: boolean }> {
    const now = new Date();
    const today = getTodayDateString();
    
    // Format 12-hour string (e.g. 09:15 AM)
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const timeStr = `${formattedHours}:${formattedMinutes} ${ampm}`;

    const punches = getStoredPunches();
    const existingIndex = punches.findIndex(
      (p) => p.employeeId === employee.id && p.date === today
    );

    const isCheckOut = existingIndex >= 0 && !punches[existingIndex].punchOutTime;

    // 1. Send live punch to backend
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("hazree_auth_token")
          : null;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${BACKEND_BASE_URL}/attendance/punch`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          employee_id: employee.id,
          employee_name: employee.fullName,
          employee_avatar: employee.avatarUrl,
          department: employee.department,
          company_id: employee.companyId,
          date: today,
          check_in_time: isCheckOut ? punches[existingIndex].punchInTime : timeStr,
          check_out_time: isCheckOut ? timeStr : "--",
          status: isCheckOut ? punches[existingIndex].status : "Present",
          location: `${employee.companyName} Premises (Verified)`,
          device: punchType,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const msg = errorData.detail || `Punch rejected: Outside assigned shift window.`;
        throw new Error(msg);
      }

      const data = await res.json();
      const mapped = mapBackendAttendanceToPunch(data, employee.employeeCode);
      const otherPunches = punches.filter((p) => !(p.employeeId === employee.id && p.date === today));
      const combined = [mapped, ...otherPunches];
      savePunches(combined);

      const isActualCheckOut = Boolean(mapped.punchOutTime && mapped.punchOutTime !== "--");
      return { record: mapped, isCheckOut: isActualCheckOut };
    } catch (err: any) {
      if (err.message && (err.message.includes("rejected") || err.message.includes("shift") || err.message.includes("Clock-in"))) {
        throw err;
      }
      console.warn("Backend punch submission offline, stored locally:", err);
    }

    // 2. Fallback: Update local state if backend unreachable
    if (isCheckOut) {
      const existing = punches[existingIndex];
      const updatedRecord: PunchRecord = {
        ...existing,
        punchOutTime: timeStr,
        workHours: 8.5,
      };

      punches[existingIndex] = updatedRecord;
      savePunches(punches);
      return { record: updatedRecord, isCheckOut: true };
    } else {
      const newRecord: PunchRecord = {
        id: Date.now(),
        employeeId: employee.id,
        employeeName: employee.fullName,
        employeeCode: employee.employeeCode,
        date: today,
        punchInTime: timeStr,
        punchOutTime: null,
        status: "Present",
        workHours: 0,
        punchLocation: `${employee.companyName} Premises`,
        geofenceStatus,
        distanceMeters,
        selfieSnapshot,
        punchType,
        notes: "Real-time verified punch",
      };

      const updated = [newRecord, ...punches.filter(p => !(p.employeeId === employee.id && p.date === today))];
      savePunches(updated);
      return { record: newRecord, isCheckOut: false };
    }
  },
};
