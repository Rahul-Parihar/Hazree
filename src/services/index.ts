/**
 * Unified API Services Export
 */

export { apiClient, ApiError } from './api/apiClient';
export type { ApiResponse, RequestOptions } from './api/apiClient';
export { ENDPOINTS } from './api/endpoints';

export { authService } from './authService';
export type { LoginCredentials, AuthTokenResponse, SuperAdminProfile } from './authService';

export { companiesService } from './companiesService';
export type {
  BackendCompanyCreate,
  BackendCompanyResponse,
  BackendCompanyUpdate,
} from './companiesService';

export { attendanceService } from './attendanceService';
export type { AttendancePunchPayload } from './attendanceService';

export { employeesService } from './employeesService';
export { leavesService } from './leavesService';
