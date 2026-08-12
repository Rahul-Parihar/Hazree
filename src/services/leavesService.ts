import { apiClient } from './api/apiClient';
import { ENDPOINTS } from './api/endpoints';
import { LeaveRequest } from '../types';

export const leavesService = {
  /**
   * Fetch all leave requests
   */
  async getLeaveRequests(companyId?: string): Promise<LeaveRequest[]> {
    return apiClient.get<LeaveRequest[]>(ENDPOINTS.LEAVES.LIST, { params: { companyId } });
  },

  /**
   * Update leave request status (Approved / Rejected)
   */
  async updateLeaveStatus(id: string, status: LeaveRequest['status']): Promise<LeaveRequest> {
    return apiClient.patch<LeaveRequest>(ENDPOINTS.LEAVES.UPDATE_STATUS(id), { status });
  },

  /**
   * Submit a new leave request
   */
  async createLeaveRequest(leave: Partial<LeaveRequest>): Promise<LeaveRequest> {
    return apiClient.post<LeaveRequest>(ENDPOINTS.LEAVES.CREATE, leave);
  },
};
