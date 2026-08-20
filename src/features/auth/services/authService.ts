import { EmployeeProfile } from "../../../types/customer";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface BackendAuthUser {
  id: number;
  email: string;
  full_name?: string;
  role: string;
  company_id?: number;
  company_name?: string;
  department?: string;
  designation?: string;
  phone?: string;
  avatar?: string;
  employee_code?: string;
  dob?: string;
  assigned_shift?: string;
  status?: string;
  is_super_admin?: boolean;
  is_active?: boolean;
}

export interface BackendLoginResponse {
  data: {
    user: BackendAuthUser;
    access_token: string;
    refresh_token?: string;
  };
  message: string;
  status: string;
}

function parseShiftDetails(rawShift?: string): { shiftName: string; shiftStart: string; shiftEnd: string } {
  if (!rawShift) {
    return { shiftName: 'Shift 1', shiftStart: '09:00 AM', shiftEnd: '06:00 PM' };
  }

  const raw = rawShift.trim();
  const shiftName = raw.includes(':') ? raw.split(':')[0].trim().replace(/General Shift/i, 'Shift 1') : raw.replace(/General Shift/i, 'Shift 1');

  // Match standard time range "08:00 PM - 08:00 AM" or "08:00 AM to 08:00 PM"
  const match = raw.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))\s*(?:-|to)\s*(\d{1,2}:\d{2}\s*(?:AM|PM))/i);
  if (match) {
    return {
      shiftName,
      shiftStart: match[1].trim(),
      shiftEnd: match[2].trim(),
    };
  }

  // Fallbacks based on shift keywords
  const lower = raw.toLowerCase();
  if (lower.includes('shift 2') || lower.includes('night') || lower.includes('evening')) {
    if (lower.includes('evening') || lower.includes('afternoon')) {
      return { shiftName: 'Shift 2 (Evening)', shiftStart: '02:00 PM', shiftEnd: '10:00 PM' };
    }
    return { shiftName: 'Shift 2 (Night)', shiftStart: '08:00 PM', shiftEnd: '08:00 AM' };
  }

  if (lower.includes('shift 3')) {
    return { shiftName: 'Shift 3 (Night)', shiftStart: '10:00 PM', shiftEnd: '06:00 AM' };
  }

  if (lower.includes('day') || lower.includes('morning')) {
    return { shiftName: 'Shift 1 (Day)', shiftStart: '08:00 AM', shiftEnd: '08:00 PM' };
  }

  return {
    shiftName: 'Shift 1 (Day Shift)',
    shiftStart: '09:00 AM',
    shiftEnd: '06:00 PM',
  };
}

const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const STORAGE_KEYS = {
  TOKEN: "hazree_auth_token",
  CURRENT_USER: "hazree_auth_user",
  CURRENT_PROFILE: "hazree_auth_profile",
  CURRENT_EMP_ID: "hazree_current_emp_id",
  EMPLOYEES: "hazree_employees_v1",
};

export const authService = {
  /**
   * Log in employee using email and password via FastAPI backend
   */
  async login(credentials: LoginCredentials): Promise<{
    user: BackendAuthUser;
    profile: EmployeeProfile;
    accessToken: string;
  }> {
    const cleanEmail = credentials.email.trim().toLowerCase();
    const password = credentials.password;

    try {
      const response = await fetch(`${BACKEND_BASE_URL}/customer/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: cleanEmail,
          password: password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorDetail =
          result?.detail ||
          result?.message ||
          "Login failed. Please verify your email and password.";
        throw new Error(errorDetail);
      }

      const user: BackendAuthUser = result.data.user;
      const accessToken = result.data.access_token;

      // Strict role check: Customer portal is only for EMPLOYEE accounts
      if (user.role && user.role !== "EMPLOYEE") {
        throw new Error(
          "It looks like this email is registered as an Administrator account. Please sign in through the Hazree Company Admin Portal."
        );
      }

      const shiftInfo = parseShiftDetails(user.assigned_shift);

      // Transform backend user data into EmployeeProfile format
      const profile: EmployeeProfile = {
        id: user.id,
        fullName: user.full_name || cleanEmail.split("@")[0],
        email: user.email,
        phone: user.phone || "+91 98765 43210",
        designation: user.designation || "Employee",
        department: user.department || "General",
        employeeCode: user.employee_code || `EMP-${user.id.toString().padStart(4, "0")}`,
        avatarUrl:
          user.avatar ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            user.full_name || cleanEmail
          )}&background=059669&color=fff`,
        shiftName: shiftInfo.shiftName,
        shiftStart: shiftInfo.shiftStart,
        shiftEnd: shiftInfo.shiftEnd,
        companyName: user.company_name || "Hazree Organization",
        companyId: user.company_id || 1,
        pin: "1234",
        geofenceRequired: true,
        photoVerificationRequired: false,
        dob: user.dob || "",
      };

      // Persist in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.TOKEN, accessToken);
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
        localStorage.setItem(STORAGE_KEYS.CURRENT_PROFILE, JSON.stringify(profile));
        localStorage.setItem(STORAGE_KEYS.CURRENT_EMP_ID, user.id.toString());

        // Update / append in stored employees list so local context has this employee
        try {
          const stored = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
          let emps: EmployeeProfile[] = stored ? JSON.parse(stored) : [];
          const idx = emps.findIndex((e) => e.id === profile.id || e.email.toLowerCase() === profile.email.toLowerCase());
          if (idx >= 0) {
            emps[idx] = { ...emps[idx], ...profile };
          } else {
            emps.push(profile);
          }
          localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(emps));
        } catch {}
      }

      return {
        user,
        profile,
        accessToken,
      };
    } catch (err: any) {
      throw err;
    }
  },

  /**
   * Get currently logged-in user from storage
   */
  getStoredAuth(): { user: BackendAuthUser | null; token: string | null } {
    if (typeof window === "undefined") return { user: null, token: null };
    try {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const userStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return {
        token,
        user: userStr ? JSON.parse(userStr) : null,
      };
    } catch {
      return { user: null, token: null };
    }
  },

  /**
   * Get stored EmployeeProfile
   */
  getStoredProfile(): EmployeeProfile | null {
    if (typeof window === "undefined") return null;
    try {
      const profileStr = localStorage.getItem(STORAGE_KEYS.CURRENT_PROFILE);
      return profileStr ? JSON.parse(profileStr) : null;
    } catch {
      return null;
    }
  },

  /**
   * Clear session on logout
   */
  logout(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_PROFILE);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_EMP_ID);
    } catch {}
  },
};
