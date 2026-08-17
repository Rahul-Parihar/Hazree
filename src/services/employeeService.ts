import { EmployeeProfile } from "../types/customer";
import { STORAGE_KEYS } from "../config/constants";
import { INITIAL_EMPLOYEES } from "../lib/mockData";

function getStoredEmployees(): EmployeeProfile[] {
  if (typeof window === "undefined") return INITIAL_EMPLOYEES;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    return data ? JSON.parse(data) : INITIAL_EMPLOYEES;
  } catch {
    return INITIAL_EMPLOYEES;
  }
}

export const employeeService = {
  getAllEmployees(): EmployeeProfile[] {
    return getStoredEmployees();
  },

  getCurrentEmployee(): EmployeeProfile {
    const employees = getStoredEmployees();
    if (typeof window === "undefined") return employees[0];
    try {
      const activeId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
      if (activeId) {
        const found = employees.find((e) => e.id === parseInt(activeId, 10));
        if (found) return found;
      }
    } catch {}
    return employees[0];
  },

  setCurrentEmployee(id: number): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, id.toString());
    } catch {}
  },

  verifyPin(pin: string): EmployeeProfile | undefined {
    const employees = getStoredEmployees();
    return employees.find((e) => e.pin === pin);
  },
};
