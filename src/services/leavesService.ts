import { apiClient } from './api/apiClient';
import { ENDPOINTS } from './api/endpoints';
import { LeaveRequest } from '../types';

export interface BackendLeaveRequest {
  id: number;
  company_id: number;
  company_name?: string;
  employee_id?: number;
  employee_name: string;
  employee_avatar?: string;
  department: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  days_count: number;
  reason: string;
  status: string;
  applied_on: string;
  admin_notes?: string;
  created_at?: string;
}

export interface CreateLeavePayload {
  employee_id?: number;
  employee_name: string;
  employee_avatar?: string;
  department?: string;
  company_id?: number;
  leave_type?: string;
  start_date: string;
  end_date: string;
  days_count?: number;
  reason: string;
  applied_on?: string;
}

export const mapBackendToLeaveRequest = (be: BackendLeaveRequest): LeaveRequest => ({
  id: `lv_${be.id}`,
  employeeId: be.employee_id ? `emp_${be.employee_id}` : `emp_${be.id}`,
  employeeName: be.employee_name,
  employeeAvatar: be.employee_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(be.employee_name)}&background=059669&color=fff`,
  department: be.department,
  leaveType: (be.leave_type as LeaveRequest['leaveType']) || 'Casual',
  startDate: be.start_date,
  endDate: be.end_date,
  daysCount: be.days_count,
  reason: be.reason,
  status: (be.status as LeaveRequest['status']) || 'Pending',
  appliedOn: be.applied_on,
});

export const leavesService = {
  /**
   * Fetch all leave requests
   */
  async getLeaveRequests(params?: { companyId?: number | string; status?: string }): Promise<LeaveRequest[]> {
    const queryParams: Record<string, any> = {};
    if (params?.companyId) queryParams.company_id = Number(String(params.companyId).replace('cmp_', ''));
    if (params?.status) queryParams.status = params.status;

    const data = await apiClient.get<BackendLeaveRequest[]>(ENDPOINTS.LEAVES.LIST, { params: queryParams });
    if (Array.isArray(data)) {
      return data.map(mapBackendToLeaveRequest);
    }
    return [];
  },

  /**
   * Update leave request status (Approved / Rejected)
   */
  async updateLeaveStatus(id: string | number, status: LeaveRequest['status'], adminNotes?: string): Promise<LeaveRequest> {
    const rawId = String(id).replace('lv_', '');
    const data = await apiClient.patch<BackendLeaveRequest>(ENDPOINTS.LEAVES.UPDATE_STATUS(rawId), {
      status,
      admin_notes: adminNotes,
    });
    return mapBackendToLeaveRequest(data);
  },

  /**
   * Submit a new leave request
   */
  async createLeaveRequest(leave: CreateLeavePayload): Promise<LeaveRequest> {
    const data = await apiClient.post<BackendLeaveRequest>(ENDPOINTS.LEAVES.CREATE, leave);
    return mapBackendToLeaveRequest(data);
  },

  /**
   * Delete leave request
   */
  async deleteLeaveRequest(id: string | number): Promise<void> {
    const rawId = String(id).replace('lv_', '');
    return apiClient.delete(`/leaves/${rawId}`);
  },
};
