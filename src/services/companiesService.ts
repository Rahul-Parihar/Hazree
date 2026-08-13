import { apiClient } from './api/apiClient';
import { ENDPOINTS } from './api/endpoints';

export interface BackendCompanyCreate {
  name: string;
  admin_name?: string;
  email?: string;
  phone?: string;
  password?: string;
  plan?: string;
  status?: string;
  location?: string;
  max_employees?: number;
  employee_count?: number;
  renewal_date?: string;
  logo?: string;
  is_active?: boolean;
}

export interface BackendCompanyResponse {
  id: number;
  name: string;
  admin_name?: string;
  email?: string;
  phone?: string;
  plan?: string;
  status?: string;
  location?: string;
  max_employees?: number;
  employee_count?: number;
  renewal_date?: string;
  logo?: string;
  is_active: boolean;
  created_at?: string;
}

export interface BackendCompanyUpdate {
  name?: string;
  admin_name?: string;
  email?: string;
  phone?: string;
  password?: string;
  plan?: string;
  status?: string;
  location?: string;
  max_employees?: number;
  employee_count?: number;
  renewal_date?: string;
  logo?: string;
  is_active?: boolean;
}

export const companiesService = {
  /**
   * Fetch all companies from backend
   */
  async getAllCompanies(skip = 0, limit = 100): Promise<BackendCompanyResponse[]> {
    return apiClient.get<BackendCompanyResponse[]>(ENDPOINTS.COMPANIES.LIST, {
      params: { skip, limit },
    });
  },

  /**
   * Create a new company on backend
   */
  async createCompany(data: BackendCompanyCreate): Promise<BackendCompanyResponse> {
    return apiClient.post<BackendCompanyResponse>(ENDPOINTS.COMPANIES.CREATE, data);
  },

  /**
   * Get single company by ID
   */
  async getCompanyById(id: string | number): Promise<BackendCompanyResponse> {
    return apiClient.get<BackendCompanyResponse>(ENDPOINTS.COMPANIES.GET_BY_ID(id));
  },

  /**
   * Update company details
   */
  async updateCompany(id: string | number, data: BackendCompanyUpdate): Promise<BackendCompanyResponse> {
    return apiClient.put<BackendCompanyResponse>(ENDPOINTS.COMPANIES.UPDATE(id), data);
  },

  /**
   * Delete / Deactivate company
   */
  async deleteCompany(id: string | number): Promise<void> {
    return apiClient.delete(ENDPOINTS.COMPANIES.DELETE(id));
  },
};

