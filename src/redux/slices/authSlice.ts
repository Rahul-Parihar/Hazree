import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { EmployeeProfile } from "@/types/customer";
import { authService, LoginCredentials } from "@/features/auth/services/authService";
import { employeeService } from "@/services";

export interface AuthState {
  user: EmployeeProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const loginAsync = createAsyncThunk(
  "auth/login",
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error?.message || "Failed to sign in. Please verify your credentials."
      );
    }
  }
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    initializeAuth: (state) => {
      const stored = authService.getStoredAuth();
      const storedProfile = authService.getStoredProfile();
      if (stored.token && storedProfile) {
        state.token = stored.token;
        state.user = storedProfile;
        state.isAuthenticated = true;
      } else if (stored.token) {
        state.token = stored.token;
        const current = employeeService.getCurrentEmployee();
        if (current) {
          state.user = current;
          state.isAuthenticated = true;
        }
      } else {
        const current = employeeService.getCurrentEmployee();
        if (current) {
          state.user = current;
        }
      }
    },
    setUser: (state, action: PayloadAction<EmployeeProfile>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
      employeeService.setCurrentEmployee(action.payload.id);
    },
    updateProfile: (state, action: PayloadAction<Partial<EmployeeProfile>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    logout: (state) => {
      authService.logout();
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.accessToken;
        state.user = action.payload.profile;
        state.error = null;
        employeeService.setCurrentEmployee(action.payload.profile.id);
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      });
  },
});

export const { initializeAuth, setUser, updateProfile, logout, clearError } =
  authSlice.actions;

export default authSlice.reducer;
