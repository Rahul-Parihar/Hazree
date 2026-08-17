export type AttendanceStatus =
  | "Present"
  | "Late"
  | "Absent"
  | "Half Day"
  | "Holiday"
  | "On Leave"
  | "Day Off";

export interface EmployeeProfile {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  designation: string;
  department: string;
  employeeCode: string;
  avatarUrl?: string;
  shiftName: string;
  shiftStart: string; // e.g. "09:00"
  shiftEnd: string; // e.g. "18:00"
  companyName: string;
  companyId: number;
  pin: string;
  geofenceRequired: boolean;
  photoVerificationRequired: boolean;
  baseSalary?: number;
  dob?: string;
  joinDate?: string;
}

export interface PunchRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeCode: string;
  date: string; // YYYY-MM-DD
  punchInTime: string; // HH:MM:SS or ISO
  punchOutTime?: string | null;
  status: AttendanceStatus;
  workHours: number; // in hours
  punchLocation?: string;
  geofenceStatus: "Inside" | "Outside" | "Remote Verified";
  distanceMeters?: number;
  selfieSnapshot?: string;
  punchType: "Web App" | "Mobile GPS" | "Kiosk PIN" | "Biometric";
  notes?: string;
}

export interface LeaveBalance {
  casual: { total: number; used: number; remaining: number };
  sick: { total: number; used: number; remaining: number };
  earned: { total: number; used: number; remaining: number };
  unpaid: { used: number };
}

export interface LeaveRequest {
  id: number;
  employeeId: number;
  employeeName: string;
  leaveType: "Casual" | "Sick" | "Earned" | "Unpaid";
  startDate: string;
  endDate: string;
  daysCount: number;
  isHalfDay: boolean;
  halfDaySession?: "Morning" | "Afternoon";
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  appliedOn: string;
  reviewedBy?: string;
  reviewComment?: string;
}

export interface ShiftDay {
  dayName: string; // "Monday", etc.
  date: string;
  isOff: boolean;
  shiftTitle: string;
  startTime: string;
  endTime: string;
  graceTimeMinutes: number;
  lunchBreakMinutes: number;
  location: string;
}

export interface CompanyOnboardingData {
  companyName: string;
  industry: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  employeeCount: number;
  city: string;
  geofenceRadiusMeters: number;
  officeLat: number;
  officeLng: number;
  planId: string;
  shiftStart: string;
  shiftEnd: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  tagline: string;
  pricePerEmpMonthly: number;
  billingPeriod: "monthly" | "yearly";
  popular?: boolean;
  features: string[];
  recommendedFor: string;
  ctaText: string;
}
