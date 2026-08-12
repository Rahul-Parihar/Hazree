import { apiClient } from './api/apiClient';
import { ENDPOINTS } from './api/endpoints';
import { AttendanceRecord } from '../types';

export interface AttendancePunchPayload {
  employeeId: string;
  companyId: string;
  status: AttendanceRecord['status'];
  location?: string;
  device?: string;
}

export const attendanceService = {
  /**
   * Fetch live attendance records
   */
  async getAttendanceLogs(params?: { date?: string; companyId?: string }): Promise<AttendanceRecord[]> {
    return apiClient.get<AttendanceRecord[]>(ENDPOINTS.ATTENDANCE.LIST, { params });
  },

  /**
   * Submit manual or kiosk punch
   */
  async markAttendance(punch: AttendancePunchPayload): Promise<AttendanceRecord> {
    return apiClient.post<AttendanceRecord>(ENDPOINTS.ATTENDANCE.PUNCH, punch);
  },

  /**
   * Get attendance analytics and health metrics
   */
  async getStats(companyId?: string): Promise<any> {
    return apiClient.get(ENDPOINTS.ATTENDANCE.STATS, { params: { companyId } });
  },
};
