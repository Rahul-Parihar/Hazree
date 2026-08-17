export const STORAGE_KEYS = {
  EMPLOYEES: "hazree_customer_employees_v2",
  CURRENT_USER_ID: "hazree_customer_current_emp_id",
  PUNCH_RECORDS: "hazree_customer_punches_v2",
  LEAVE_REQUESTS: "hazree_customer_leaves_v2",
  LEAVE_BALANCE: "hazree_customer_balance_v2",
  ONBOARDED_COMPANIES: "hazree_customer_companies_v2",
  USER_PREFERENCES: "hazree_customer_prefs_v2",
} as const;

export const DEFAULT_GEOFENCE_RADIUS_METERS = 50;
export const DEFAULT_GRACE_TIME_MINUTES = 15;
export const STANDARD_WORK_HOURS_PER_DAY = 9;
