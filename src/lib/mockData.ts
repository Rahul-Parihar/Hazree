import { Company, Employee, AttendanceRecord, LeaveRequest, UserProfile } from '../types';

export const currentUserSuperAdmin: UserProfile = {
  id: 'usr_super_01',
  name: 'Anand Patel',
  email: 'superadmin@hazree.com',
  role: 'SUPER_ADMIN',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  companyName: 'Hazree Platform HQ',
};

export const currentUserCompanyAdmin: UserProfile = {
  id: 'usr_cmp_01',
  name: 'Rajesh Sharma',
  email: 'admin@tatatech.com',
  role: 'COMPANY_ADMIN',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  companyName: 'Tata Tech Solutions',
};

export const initialCompanies: Company[] = [];

export const mockAttendanceRecords: AttendanceRecord[] = [];

export const mockEmployees: Employee[] = [];

export const mockLeaveRequests: LeaveRequest[] = [];

