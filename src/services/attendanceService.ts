import { apiClient } from './api/apiClient';
import { ENDPOINTS } from './api/endpoints';
import { AttendanceRecord } from '../types';

export interface BackendAttendanceRecord {
  id: number;
  company_id: number;
  company_name?: string;
  employee_id?: number;
  employee_name: string;
  employee_avatar?: string;
  department: string;
  date: string;
  check_in_time: string;
  check_out_time?: string;
  status: string;
  work_hours?: string;
  location?: string;
  device?: string;
  created_at?: string;
}

export interface AttendancePunchPayload {
  employee_id?: number;
  employee_name: string;
  employee_avatar?: string;
  department?: string;
  company_id?: number;
  date?: string;
  check_in_time?: string;
  check_out_time?: string;
  status?: AttendanceRecord['status'];
  work_hours?: string;
  location?: string;
  device?: string;
}

export interface AttendanceStatsData {
  total_staff: number;
  present_today: number;
  late_today: number;
  absent_today: number;
  half_day_today: number;
  attendance_rate: number;
}

export const mapBackendToAttendanceRecord = (be: BackendAttendanceRecord): AttendanceRecord => ({
  id: `att_${be.id}`,
  employeeId: be.employee_id ? `emp_${be.employee_id}` : `emp_${be.id}`,
  employeeName: be.employee_name,
  employeeAvatar: be.employee_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(be.employee_name)}&background=059669&color=fff`,
  companyId: `cmp_${be.company_id}`,
  department: be.department,
  date: be.date,
  checkInTime: be.check_in_time,
  checkOutTime: be.check_out_time || '--',
  checkIn: be.check_in_time,
  checkOut: be.check_out_time || '--',
  status: (be.status as AttendanceRecord['status']) || 'Present',
  workHours: be.work_hours || 'Active',
  location: be.location || 'Office Premises (Verified)',
  device: be.device || 'Web Portal Punch',
});

export const attendanceService = {
  /**
   * Fetch live attendance records
   */
  async getAttendanceLogs(params?: { date?: string; status?: string; companyId?: number | string }): Promise<AttendanceRecord[]> {
    const queryParams: Record<string, any> = {};
    if (params?.date) queryParams.date = params.date;
    if (params?.status) queryParams.status = params.status;
    if (params?.companyId) queryParams.company_id = Number(String(params.companyId).replace('cmp_', ''));

    const data = await apiClient.get<BackendAttendanceRecord[]>(ENDPOINTS.ATTENDANCE.LIST, { params: queryParams });
    if (Array.isArray(data)) {
      return data.map(mapBackendToAttendanceRecord);
    }
    return [];
  },

  /**
   * Submit manual or kiosk punch
   */
  async markAttendance(punch: AttendancePunchPayload): Promise<AttendanceRecord> {
    const data = await apiClient.post<BackendAttendanceRecord>(ENDPOINTS.ATTENDANCE.PUNCH, punch);
    return mapBackendToAttendanceRecord(data);
  },

  /**
   * Get attendance analytics and health metrics
   */
  async getStats(companyId?: number | string, date?: string): Promise<AttendanceStatsData> {
    const queryParams: Record<string, any> = {};
    if (companyId) queryParams.company_id = Number(String(companyId).replace('cmp_', ''));
    if (date) queryParams.date = date;

    return apiClient.get<AttendanceStatsData>(ENDPOINTS.ATTENDANCE.STATS, { params: queryParams });
  },

  /**
   * Delete attendance record
   */
  async deleteAttendance(id: string | number): Promise<void> {
    const rawId = String(id).replace('att_', '');
    return apiClient.delete(`/attendance/${rawId}`);
  },
};
