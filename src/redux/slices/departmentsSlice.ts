import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  departmentsService,
  BackendDepartment,
  BackendDepartmentCreate,
  BackendDepartmentUpdate,
} from '../../services/departmentsService';

interface DepartmentsState {
  departments: BackendDepartment[];
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: DepartmentsState = {
  departments: [],
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  error: null,
  successMessage: null,
};

export const fetchDepartmentsAsync = createAsyncThunk(
  'departments/fetchDepartments',
  async (companyId: number | string | undefined, { rejectWithValue }) => {
    try {
      const data = await departmentsService.getDepartments(companyId);
      return data;
    } catch (err: any) {
      if (err?.status !== 401 && err?.status !== 403) {
        console.warn('Backend fetch departments warning:', err?.message);
      }
      return rejectWithValue(err?.message || 'Failed to fetch departments');
    }
  }
);

export const createDepartmentAsync = createAsyncThunk(
  'departments/createDepartment',
  async (payload: BackendDepartmentCreate, { rejectWithValue }) => {
    try {
      const created = await departmentsService.createDepartment(payload);
      return created;
    } catch (err: any) {
      const msg =
        (err.details && typeof err.details === 'object' && (err.details.detail || err.details.message)) ||
        err.message ||
        'Failed to create department';
      return rejectWithValue(msg);
    }
  }
);

export const updateDepartmentAsync = createAsyncThunk(
  'departments/updateDepartment',
  async (
    { id, data }: { id: number | string; data: BackendDepartmentUpdate },
    { rejectWithValue }
  ) => {
    try {
      const updated = await departmentsService.updateDepartment(id, data);
      return updated;
    } catch (err: any) {
      const msg =
        (err.details && typeof err.details === 'object' && (err.details.detail || err.details.message)) ||
        err.message ||
        'Failed to update department';
      return rejectWithValue(msg);
    }
  }
);

export const deleteDepartmentAsync = createAsyncThunk(
  'departments/deleteDepartment',
  async (id: number | string, { rejectWithValue }) => {
    try {
      await departmentsService.deleteDepartment(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to delete department');
    }
  }
);

const departmentsSlice = createSlice({
  name: 'departments',
  initialState,
  reducers: {
    clearDepartmentError: (state) => {
      state.error = null;
    },
    clearDepartmentSuccess: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch
    builder
      .addCase(fetchDepartmentsAsync.pending, (state) => {
        if (state.departments.length === 0) {
          state.isLoading = true;
        }
        state.error = null;
      })
      .addCase(fetchDepartmentsAsync.fulfilled, (state, action: PayloadAction<BackendDepartment[]>) => {
        state.isLoading = false;
        state.departments = action.payload;
      })
      .addCase(fetchDepartmentsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create
    builder
      .addCase(createDepartmentAsync.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createDepartmentAsync.fulfilled, (state, action: PayloadAction<BackendDepartment>) => {
        state.isCreating = false;
        // Avoid duplicate in state
        if (!state.departments.some((d) => d.id === action.payload.id)) {
          state.departments.push(action.payload);
          state.departments.sort((a, b) => a.name.localeCompare(b.name));
        }
        state.successMessage = `Department "${action.payload.name}" added successfully!`;
      })
      .addCase(createDepartmentAsync.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      });

    // Update
    builder
      .addCase(updateDepartmentAsync.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateDepartmentAsync.fulfilled, (state, action: PayloadAction<BackendDepartment>) => {
        state.isUpdating = false;
        const index = state.departments.findIndex((d) => d.id === action.payload.id);
        if (index !== -1) {
          state.departments[index] = action.payload;
          state.departments.sort((a, b) => a.name.localeCompare(b.name));
        }
        state.successMessage = `Department "${action.payload.name}" updated successfully!`;
      })
      .addCase(updateDepartmentAsync.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Delete
    builder.addCase(deleteDepartmentAsync.fulfilled, (state, action) => {
      state.departments = state.departments.filter((d) => d.id !== Number(action.payload));
      state.successMessage = 'Department deleted successfully.';
    });
  },
});

export const { clearDepartmentError, clearDepartmentSuccess } = departmentsSlice.actions;
export default departmentsSlice.reducer;
