import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { UserRole, UserProfile } from '../../types';
import { currentUserSuperAdmin, currentUserCompanyAdmin } from '../../lib/mockData';
import { authService, LoginCredentials } from '../../services';

interface AuthState {
  userRole: UserRole;
  currentUser: UserProfile;
  isAuthenticated: boolean;
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

const initialRole = getInitialRole();

const initialState: AuthState = {
  userRole: initialRole,
  currentUser: initialRole === 'SUPER_ADMIN' ? currentUserSuperAdmin : currentUserCompanyAdmin,
  isAuthenticated: true,
  isLoading: false,
  error: null,
};

/**
 * Async thunk to authenticate Super Admin against FastAPI backend
 * Sets 15-Minute Access Token + 7-Day Refresh Token in HTTP-Only browser cookies.
 */
export const loginSuperAdminAsync = createAsyncThunk(
  'auth/loginSuperAdmin',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.loginSuperAdmin(credentials);
      return {
        email: credentials.email || credentials.username || 'admin@hazree.com',
        user: response.data?.user || (response as any).user,
      };
    } catch (err: any) {

      const errorMsg =
        (err.details && typeof err.details === 'object' && err.details.detail) ||
        err.message ||
        'Authentication failed';
      return rejectWithValue(errorMsg);
    }
  }
);


/**
 * Async thunk to verify active HTTP-Only cookie session
 */
export const checkSessionAsync = createAsyncThunk(
  'auth/checkSession',
  async (_, { rejectWithValue }) => {
    try {
      const profile = await authService.getSuperAdminProfile();
      return profile;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Session expired');
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
      action: PayloadAction<{ role: UserRole; email?: string; name?: string }>
    ) => {
      state.userRole = action.payload.role;
      state.isAuthenticated = true;
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
      }
    },
    logout: (state) => {
      state.isAuthenticated = false;
      authService.logoutSuperAdmin().catch(() => {});
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
        if (savedRole && (savedRole === 'SUPER_ADMIN' || savedRole === 'COMPANY_ADMIN')) {
          state.userRole = savedRole;
          state.currentUser = savedRole === 'SUPER_ADMIN' ? currentUserSuperAdmin : currentUserCompanyAdmin;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginSuperAdminAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginSuperAdminAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.userRole = 'SUPER_ADMIN';
        state.currentUser = {
          ...currentUserSuperAdmin,
          email: action.payload.email,
          name: action.payload.user?.full_name || currentUserSuperAdmin.name,
        };
        if (typeof window !== 'undefined') {
          localStorage.setItem('hazree_user_role', 'SUPER_ADMIN');
        }
      })
      .addCase(loginSuperAdminAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || 'Authentication failed';
      })
      // Session Check
      .addCase(checkSessionAsync.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        if (action.payload?.email) {
          state.currentUser = {
            ...state.currentUser,
            email: action.payload.email,
            name: action.payload.full_name || state.currentUser.name,
          };
        }
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
