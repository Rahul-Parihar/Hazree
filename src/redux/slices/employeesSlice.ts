import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Employee, EmployeeStatus } from '../../types';
import { mockEmployees } from '../../lib/mockData';
import { employeesService, BackendEmployeeCreate, BackendEmployeeResponse } from '../../services/employeesService';

interface EmployeesState {
  employees: Employee[];
  searchQuery: string;
  departmentFilter: string;
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: EmployeesState = {
  employees: [],
  searchQuery: '',
  departmentFilter: 'ALL',
  isLoading: false,
  isCreating: false,
  error: null,
  successMessage: null,
};

const mapBackendToEmployee = (be: BackendEmployeeResponse): Employee => ({
  id: `emp_${be.id}`,
  companyId: `cmp_${be.company_id}`,
  companyName: be.company_name || 'Organization',
  name: be.name,
  email: be.email,
  phone: be.phone || '',
  role: be.role,
  department: be.department,
  avatar: be.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(be.name)}&background=059669&color=fff`,
  joinDate: be.join_date || (be.created_at ? be.created_at.split('T')[0] : '14/08/2026'),
  status: (be.status as EmployeeStatus) || 'Active',
});

/**
 * Async Thunk to fetch employees list from backend
 */
export const fetchEmployeesAsync = createAsyncThunk(
  'employees/fetchEmployees',
  async (companyId: number | undefined, { rejectWithValue }) => {
    try {
      const data = await employeesService.getAllEmployees(companyId);
      if (Array.isArray(data) && data.length > 0) {
        return data.map(mapBackendToEmployee);
      }
      return [];
    } catch (err: any) {
      if (err?.status !== 401 && err?.status !== 403) {
        console.warn('Backend fetch employees warning:', err?.message);
      }
      return rejectWithValue(err?.message || 'Failed to fetch employees');
    }
  }
);

/**
 * Async Thunk to create a new employee on backend
 */
export const createEmployeeAsync = createAsyncThunk(
  'employees/createEmployee',
  async (payload: BackendEmployeeCreate, { rejectWithValue }) => {
    try {
      const created = await employeesService.createEmployee(payload);
      return mapBackendToEmployee(created);
    } catch (err: any) {
      const msg =
        (err.details && typeof err.details === 'object' && (err.details.detail || err.details.message)) ||
        err.message ||
        'Failed to register employee';
      return rejectWithValue(msg);
    }
  }
);

/**
 * Async Thunk to update an employee on backend
 */
export const updateEmployeeAsync = createAsyncThunk(
  'employees/updateEmployee',
  async (
    { id, data }: { id: string; data: Partial<BackendEmployeeCreate> },
    { rejectWithValue }
  ) => {
    try {
      const rawId = id.replace('emp_', '');
      const updated = await employeesService.updateEmployee(rawId, data);
      return mapBackendToEmployee(updated);
    } catch (err: any) {
      const msg =
        (err.details && typeof err.details === 'object' && (err.details.detail || err.details.message)) ||
        err.message ||
        'Failed to update employee';
      return rejectWithValue(msg);
    }
  }
);

/**
 * Async Thunk to delete an employee on backend
 */
export const deleteEmployeeAsync = createAsyncThunk(
  'employees/deleteEmployee',
  async (employeeId: string, { rejectWithValue }) => {
    try {
      const rawId = employeeId.replace('emp_', '');
      await employeesService.deleteEmployee(rawId);
      return employeeId;
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to delete employee');
    }
  }
);

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
    clearEmployeeError: (state) => {
      state.error = null;
    },
    clearEmployeeSuccess: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Employees
      .addCase(fetchEmployeesAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEmployeesAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.employees = action.payload || [];
      })
      .addCase(fetchEmployeesAsync.rejected, (state, action) => {
        state.isLoading = false;
        // Keep existing/mock employees if backend fails
      })

      // Create Employee
      .addCase(createEmployeeAsync.pending, (state) => {
        state.isCreating = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createEmployeeAsync.fulfilled, (state, action) => {
        state.isCreating = false;
        state.employees.unshift(action.payload);
        state.successMessage = `Employee "${action.payload.name}" successfully registered!`;
      })
      .addCase(createEmployeeAsync.rejected, (state, action) => {
        state.isCreating = false;
        state.error = (action.payload as string) || 'Failed to add employee';
      })

      // Update Employee
      .addCase(updateEmployeeAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateEmployeeAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.employees.findIndex((e) => e.id === action.payload.id);
        if (index !== -1) {
          state.employees[index] = action.payload;
        }
        state.successMessage = `Employee "${action.payload.name}" updated successfully!`;
      })
      .addCase(updateEmployeeAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || 'Failed to update employee';
      })

      // Delete Employee
      .addCase(deleteEmployeeAsync.fulfilled, (state, action) => {
        state.employees = state.employees.filter((e) => e.id !== action.payload);
        state.successMessage = 'Employee deleted successfully.';
      });
  },
});

export const {
  addEmployee,
  updateEmployee,
  updateEmployeeStatus,
  deleteEmployee,
  setEmployeeSearchQuery,
  setEmployeeDepartmentFilter,
  clearEmployeeError,
  clearEmployeeSuccess,
} = employeesSlice.actions;

export default employeesSlice.reducer;
