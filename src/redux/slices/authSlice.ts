import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { UserRole, UserProfile } from '../../types';
import { currentUserSuperAdmin, currentUserCompanyAdmin } from '../../lib/mockData';
import { authService, LoginCredentials } from '../../services';

interface AuthState {
  userRole: UserRole;
  currentUser: UserProfile;
  isAuthenticated: boolean;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

const getInitialRole = (): UserRole => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('hazree_user_role') as UserRole;
    if (saved === 'SUPER_ADMIN' || saved === 'COMPANY_ADMIN' || saved === 'EMPLOYEE') {
      return saved;
    }
  }
  return 'SUPER_ADMIN';
};

const getInitialToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('hazree_auth_token');
  }
  return null;
};

const initialRole = getInitialRole();

const initialState: AuthState = {
  userRole: initialRole,
  currentUser: initialRole === 'SUPER_ADMIN' ? currentUserSuperAdmin : currentUserCompanyAdmin,
  isAuthenticated: true,
  token: getInitialToken(),
  isLoading: false,
  error: null,
};

/**
 * Async thunk to authenticate Super Admin against FastAPI backend
 */
export const loginSuperAdminAsync = createAsyncThunk(
  'auth/loginSuperAdmin',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.loginSuperAdmin(credentials);
      return {
        token: response.access_token,
        email: credentials.username,
      };
    } catch (err: any) {
      return rejectWithValue(err.message || 'Authentication failed');
    }
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUserRole: (state, action: PayloadAction<UserRole>) => {
      state.userRole = action.payload;
      state.currentUser = action.payload === 'SUPER_ADMIN' ? currentUserSuperAdmin : currentUserCompanyAdmin;
      if (typeof window !== 'undefined') {
        localStorage.setItem('hazree_user_role', action.payload);
      }
    },
    toggleUserRole: (state) => {
      const nextRole: UserRole = state.userRole === 'SUPER_ADMIN' ? 'COMPANY_ADMIN' : 'SUPER_ADMIN';
      state.userRole = nextRole;
      state.currentUser = nextRole === 'SUPER_ADMIN' ? currentUserSuperAdmin : currentUserCompanyAdmin;
      if (typeof window !== 'undefined') {
        localStorage.setItem('hazree_user_role', nextRole);
      }
    },
    login: (
      state,
      action: PayloadAction<{ role: UserRole; email?: string; name?: string; token?: string }>
    ) => {
      state.userRole = action.payload.role;
      state.isAuthenticated = true;
      state.token = action.payload.token || null;
      if (action.payload.role === 'SUPER_ADMIN') {
        state.currentUser = {
          ...currentUserSuperAdmin,
          email: action.payload.email || currentUserSuperAdmin.email,
        };
      } else {
        state.currentUser = {
          ...currentUserCompanyAdmin,
          email: action.payload.email || currentUserCompanyAdmin.email,
        };
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('hazree_user_role', action.payload.role);
        if (action.payload.token) {
          localStorage.setItem('hazree_auth_token', action.payload.token);
        }
      }
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      authService.clearAuth();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('hazree_user_role');
      }
    },
    updateUserProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      state.currentUser = { ...state.currentUser, ...action.payload };
    },
    initializeAuth: (state) => {
      if (typeof window !== 'undefined') {
        const savedRole = localStorage.getItem('hazree_user_role') as UserRole;
        const savedToken = localStorage.getItem('hazree_auth_token');
        if (savedRole && (savedRole === 'SUPER_ADMIN' || savedRole === 'COMPANY_ADMIN')) {
          state.userRole = savedRole;
          state.currentUser = savedRole === 'SUPER_ADMIN' ? currentUserSuperAdmin : currentUserCompanyAdmin;
        }
        if (savedToken) {
          state.token = savedToken;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginSuperAdminAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginSuperAdminAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.userRole = 'SUPER_ADMIN';
        state.currentUser = {
          ...currentUserSuperAdmin,
          email: action.payload.email,
        };
        if (typeof window !== 'undefined') {
          localStorage.setItem('hazree_user_role', 'SUPER_ADMIN');
          localStorage.setItem('hazree_auth_token', action.payload.token);
        }
      })
      .addCase(loginSuperAdminAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || 'Authentication failed';
      });
  },
});

export const {
  setUserRole,
  toggleUserRole,
  login,
  logout,
  updateUserProfile,
  initializeAuth,
} = authSlice.actions;

export default authSlice.reducer;

