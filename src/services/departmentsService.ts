import { apiClient } from './api/apiClient';
import { ENDPOINTS } from './api/endpoints';

export interface BackendDepartment {
  id: number;
  name: string;
  description?: string;
  company_id?: number;
  company_name?: string;
  created_by_role?: string;
  is_active: boolean;
  created_at?: string;
}

export interface BackendDepartmentCreate {
  name: string;
  description?: string;
  company_id?: number;
}

export const departmentsService = {
  /**
   * Fetch all global & company departments
   */
  async getDepartments(companyId?: number | string): Promise<BackendDepartment[]> {
    const params: Record<string, any> = {};
    if (companyId) {
      params.company_id = Number(String(companyId).replace('cmp_', ''));
    }
    return apiClient.get<BackendDepartment[]>('/api/v1/departments', { params });
  },

  /**
   * Create a new department
   */
  async createDepartment(data: BackendDepartmentCreate): Promise<BackendDepartment> {
    return apiClient.post<BackendDepartment>('/api/v1/departments', data);
  },

  /**
   * Delete a department
   */
  async deleteDepartment(id: number | string): Promise<void> {
    return apiClient.delete(`/api/v1/departments/${id}`);
  },
};
