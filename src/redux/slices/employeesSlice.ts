import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Employee, EmployeeStatus } from '../../types';
import { mockEmployees } from '../../lib/mockData';

interface EmployeesState {
  employees: Employee[];
  searchQuery: string;
  departmentFilter: string;
}

const initialState: EmployeesState = {
  employees: mockEmployees,
  searchQuery: '',
  departmentFilter: 'ALL',
};

export const employeesSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    addEmployee: (state, action: PayloadAction<Employee>) => {
      state.employees.unshift(action.payload);
    },
    updateEmployee: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<Employee> }>
    ) => {
      const index = state.employees.findIndex((e) => e.id === action.payload.id);
      if (index !== -1) {
        state.employees[index] = { ...state.employees[index], ...action.payload.updates };
      }
    },
    updateEmployeeStatus: (
      state,
      action: PayloadAction<{ id: string; status: EmployeeStatus }>
    ) => {
      const emp = state.employees.find((e) => e.id === action.payload.id);
      if (emp) {
        emp.status = action.payload.status;
      }
    },
    deleteEmployee: (state, action: PayloadAction<string>) => {
      state.employees = state.employees.filter((e) => e.id !== action.payload);
    },
    setEmployeeSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setEmployeeDepartmentFilter: (state, action: PayloadAction<string>) => {
      state.departmentFilter = action.payload;
    },
  },
});

export const {
  addEmployee,
  updateEmployee,
  updateEmployeeStatus,
  deleteEmployee,
  setEmployeeSearchQuery,
  setEmployeeDepartmentFilter,
} = employeesSlice.actions;

export default employeesSlice.reducer;
