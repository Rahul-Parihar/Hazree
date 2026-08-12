import { apiClient } from './api/apiClient';
import { ENDPOINTS } from './api/endpoints';
import { Employee } from '../types';

export const employeesService = {
  /**
   * Get employee directory
   */
  async getEmployees(companyId?: string): Promise<Employee[]> {
    return apiClient.get<Employee[]>(ENDPOINTS.EMPLOYEES.LIST, { params: { companyId } });
  },

  /**
   * Create new employee
   */
  async createEmployee(employee: Partial<Employee>): Promise<Employee> {
    return apiClient.post<Employee>(ENDPOINTS.EMPLOYEES.CREATE, employee);
  },

  /**
   * Get employee by ID
   */
  async getEmployeeById(id: string): Promise<Employee> {
    return apiClient.get<Employee>(ENDPOINTS.EMPLOYEES.GET_BY_ID(id));
  },

  /**
   * Update employee details
   */
  async updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee> {
    return apiClient.put<Employee>(ENDPOINTS.EMPLOYEES.UPDATE(id), updates);
  },

  /**
   * Delete employee
   */
  async deleteEmployee(id: string): Promise<void> {
    return apiClient.delete(ENDPOINTS.EMPLOYEES.DELETE(id));
  },
};
