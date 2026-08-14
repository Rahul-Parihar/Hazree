import { apiClient } from './api/apiClient';
import { ENDPOINTS } from './api/endpoints';

export interface BackendEmployeeCreate {
  name: string;
  email: string;
  phone?: string;
  role: string;
  department: string;
  avatar?: string;
  status?: string;
  join_date?: string;
  company_id?: number;
}

export interface BackendEmployeeResponse {
  id: number;
  company_id: number;
  company_name?: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  department: string;
  avatar?: string;
  status: string;
  join_date?: string;
  created_at?: string;
}

export const employeesService = {
  /**
   * Fetch all employees from FastAPI backend (scoped automatically for company admin)
   */
  async getAllEmployees(companyId?: number): Promise<BackendEmployeeResponse[]> {
    return apiClient.get<BackendEmployeeResponse[]>(ENDPOINTS.EMPLOYEES.LIST, {
      params: companyId ? { company_id: companyId } : undefined,
    });
  },

  /**
   * Register a new staff employee for the organization
   */
  async createEmployee(data: BackendEmployeeCreate): Promise<BackendEmployeeResponse> {
    return apiClient.post<BackendEmployeeResponse>(ENDPOINTS.EMPLOYEES.CREATE, data);
  },

  /**
   * Get employee by ID
   */
  async getEmployeeById(id: string | number): Promise<BackendEmployeeResponse> {
    return apiClient.get<BackendEmployeeResponse>(ENDPOINTS.EMPLOYEES.GET_BY_ID(String(id)));
  },

  /**
   * Update employee details
   */
  async updateEmployee(id: string | number, data: Partial<BackendEmployeeCreate>): Promise<BackendEmployeeResponse> {
    return apiClient.put<BackendEmployeeResponse>(ENDPOINTS.EMPLOYEES.UPDATE(String(id)), data);
  },

  /**
   * Delete employee by ID
   */
  async deleteEmployee(id: string | number): Promise<{ status: string; message: string }> {
    return apiClient.delete(ENDPOINTS.EMPLOYEES.DELETE(String(id)));
  },
};
