import { UserRole, EmployeePermissions } from '../types';

/**
 * Role-Based Access Control (RBAC) & Granular Permission Helpers
 * Supports both role presets (HR_ADMIN, MANAGER, COMPANY_ADMIN) and custom permissions
 */

export const STAFF_PRESET_PERMISSIONS: EmployeePermissions = {
  can_manual_punch: false,
  can_manage_staff: false,
  can_approve_leaves: false,
  can_view_phone: false,
};

export const HR_ADMIN_PRESET_PERMISSIONS: EmployeePermissions = {
  can_manual_punch: true,
  can_manage_staff: true,
  can_approve_leaves: true,
  can_view_phone: true,
};

export const MANAGER_PRESET_PERMISSIONS: EmployeePermissions = {
  can_manual_punch: true,
  can_manage_staff: false,
  can_approve_leaves: true,
  can_view_phone: true,
};

/**
 * Check if the user role is part of the Company portal (Company Admin, HR Admin, or Manager)
 */
export const isCompanyPortalRole = (role?: UserRole | null): boolean => {
  return role === 'COMPANY_ADMIN' || role === 'HR_ADMIN' || role === 'MANAGER';
};

/**
 * Check if the user can perform Manual Clock-In / Clock-Out Punch for employees without phones
 */
export const canManualPunch = (
  role?: UserRole | null,
  permissions?: EmployeePermissions | null
): boolean => {
  if (role === 'COMPANY_ADMIN') return true; // Company owner can also punch
  if (permissions && typeof permissions.can_manual_punch === 'boolean') {
    return permissions.can_manual_punch;
  }
  return role === 'HR_ADMIN' || role === 'MANAGER';
};

/**
 * Check if the user can onboard new staff (Add Employee) and edit employee profile / shifts
 */
export const canManageStaff = (
  role?: UserRole | null,
  permissions?: EmployeePermissions | null
): boolean => {
  if (role === 'COMPANY_ADMIN') return true;
  if (permissions && typeof permissions.can_manage_staff === 'boolean') {
    return permissions.can_manage_staff;
  }
  return role === 'HR_ADMIN';
};

/**
 * Check if the user can approve or reject employee leave requests
 */
export const canApproveLeaves = (
  role?: UserRole | null,
  permissions?: EmployeePermissions | null
): boolean => {
  if (role === 'COMPANY_ADMIN') return true;
  if (permissions && typeof permissions.can_approve_leaves === 'boolean') {
    return permissions.can_approve_leaves;
  }
  return role === 'HR_ADMIN' || role === 'MANAGER';
};

/**
 * Check if the user can access company billing, plan renewals, and payment settings
 * Allowed exclusively for: Company Owner (COMPANY_ADMIN) and Super Admin (SUPER_ADMIN)
 */
export const canAccessBilling = (role?: UserRole | null): boolean => {
  return role === 'COMPANY_ADMIN' || role === 'SUPER_ADMIN';
};

/**
 * Check if the user can access confidential employee contact phone numbers
 */
export const canViewEmployeePhone = (
  role?: UserRole | null,
  permissions?: EmployeePermissions | null
): boolean => {
  if (role === 'COMPANY_ADMIN') return true;
  if (permissions && typeof permissions.can_view_phone === 'boolean') {
    return permissions.can_view_phone;
  }
  return role === 'HR_ADMIN' || role === 'MANAGER';
};
