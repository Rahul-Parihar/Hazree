/**
 * Centralized API Endpoints Definition
 */

export const ENDPOINTS = {
  // Super Admin Authentication
  AUTH: {
    SUPER_ADMIN_LOGIN: '/super-admin/login',
    SUPER_ADMIN_LOGOUT: '/super-admin/logout',
    SUPER_ADMIN_ME: '/super-admin/me',
    SUPER_ADMIN_REGISTER: '/super-admin/register',
    SUPER_ADMIN_OVERVIEW: '/super-admin/',
    DB_STATUS: '/super-admin/db-status',
  },

  // Multi-Tenant Companies
  COMPANIES: {
    LIST: '/companies/',
    CREATE: '/companies/',
    GET_BY_ID: (id: string | number) => `/companies/${id}`,
    UPDATE: (id: string | number) => `/companies/${id}`,
    DELETE: (id: string | number) => `/companies/${id}`,
  },

  // Attendance & Check-ins
  ATTENDANCE: {
    LIST: '/attendance/',
    PUNCH: '/attendance/punch',
    STATS: '/attendance/stats',
    GET_BY_ID: (id: string) => `/attendance/${id}`,
  },

  // Employees & Directory
  EMPLOYEES: {
    LIST: '/employees/',
    CREATE: '/employees/',
    GET_BY_ID: (id: string) => `/employees/${id}`,
    UPDATE: (id: string) => `/employees/${id}`,
    DELETE: (id: string) => `/employees/${id}`,
  },

  // Leave Requests & Approvals
  LEAVES: {
    LIST: '/leaves/',
    CREATE: '/leaves/',
    UPDATE_STATUS: (id: string) => `/leaves/${id}/status`,
    GET_BY_ID: (id: string) => `/leaves/${id}`,
  },

  // Health check
  HEALTH: '/health',
  ROOT: '/',
} as const;
