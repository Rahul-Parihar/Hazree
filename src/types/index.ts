export type UserRole = 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'EMPLOYEE';

export type PlanType = 'Trial' | 'Growth' | 'Enterprise';
export type CompanyStatus = 'Active' | 'Pending' | 'Suspended';

export interface Company {
  id: string;
  name: string;
  code: string; // e.g. HAZ-1001
  logo?: string;
  adminName: string;
  adminEmail: string;
  adminPhone: string;
  plan: PlanType;
  status: CompanyStatus;
  employeeCount: number;
  maxEmployees: number;
  createdAt: string;
  location: string;
  renewalDate: string;
}

export type EmployeeStatus = 'Active' | 'On Leave' | 'Inactive';

export interface Employee {
  id: string;
  companyId: string;
  companyName: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  avatar: string;
  joinDate: string;
  status: EmployeeStatus;
}

export type AttendanceStatus = 'Present' | 'Late' | 'Absent' | 'Half Day';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar: string;
  companyId: string;
  department: string;
  date: string;
  checkInTime: string;
  checkOutTime?: string;
  status: AttendanceStatus;
  workHours?: string;
  location: string;
  device: string;
}

export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';
export type LeaveType = 'Paid' | 'Sick' | 'Casual' | 'Unpaid';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar: string;
  department: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  status: LeaveStatus;
  appliedOn: string;
}

export interface StatMetric {
  title: string;
  value: string | number;
  change: string;
  isPositive: boolean;
  subtext: string;
  iconName: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  companyName?: string;
}
