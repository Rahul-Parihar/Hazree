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
    if (
      saved === 'SUPER_ADMIN' ||
      saved === 'COMPANY_ADMIN' ||
      saved === 'HR_ADMIN' ||
      saved === 'MANAGER' ||
      saved === 'EMPLOYEE'
    ) {
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
      const user = response.data?.user || (response as any).user;
      
      // Strict role check: Employees cannot log into Company Admin
      if (user && user.role === 'EMPLOYEE') {
        return rejectWithValue(
          'It looks like this email is registered as an Employee account. Please sign in through the Hazree Employee & Customer Portal.'
        );
      }

      const token = response.data?.access_token;
      if (token && typeof window !== 'undefined') {
        localStorage.setItem('hazree_access_token', token);
      }
      return {
        email: credentials.email || credentials.username || 'admin@hazree.com',
        user: user,
        accessToken: token,
      };
    } catch (err: any) {
      const errorMsg =
        (err.details && typeof err.details === 'object' && (err.details.detail || err.details.message)) ||
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
      action: PayloadAction<{ role: UserRole; email?: string; name?: string; companyName?: string; companyId?: string }>
    ) => {
      state.userRole = action.payload.role;
      state.isAuthenticated = true;
      state.currentUser = {
        id: action.payload.companyId || (action.payload.role === 'SUPER_ADMIN' ? 'admin_1' : 'cmp_admin_1'),
        name: action.payload.name || (action.payload.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Company Admin'),
        email: action.payload.email || (action.payload.role === 'SUPER_ADMIN' ? 'admin@hazree.com' : 'admin@company.com'),
        role: action.payload.role,
        companyName: action.payload.companyName || (action.payload.role === 'SUPER_ADMIN' ? 'Platform HQ' : 'Company Portal'),
        companyId: action.payload.companyId,
        avatar: action.payload.role === 'SUPER_ADMIN'
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('hazree_user_role', action.payload.role);
        localStorage.setItem('hazree_current_user', JSON.stringify(state.currentUser));
      }
    },
    logout: (state) => {
      state.isAuthenticated = false;
      authService.logoutSuperAdmin().catch(() => {});
      if (typeof window !== 'undefined') {
        localStorage.removeItem('hazree_access_token');
        localStorage.removeItem('hazree_user_role');
        localStorage.removeItem('hazree_current_user');
      }
    },
    updateUserProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      state.currentUser = { ...state.currentUser, ...action.payload };
      if (typeof window !== 'undefined') {
        localStorage.setItem('hazree_current_user', JSON.stringify(state.currentUser));
      }
    },
    initializeAuth: (state) => {
      if (typeof window !== 'undefined') {
        const savedRole = localStorage.getItem('hazree_user_role') as UserRole;
        const savedUserStr = localStorage.getItem('hazree_current_user');
        if (savedRole && (savedRole === 'SUPER_ADMIN' || savedRole === 'COMPANY_ADMIN')) {
          state.userRole = savedRole;
          if (savedUserStr) {
            try {
              state.currentUser = JSON.parse(savedUserStr);
            } catch {
              state.currentUser = savedRole === 'SUPER_ADMIN' ? currentUserSuperAdmin : currentUserCompanyAdmin;
            }
          } else {
            state.currentUser = savedRole === 'SUPER_ADMIN' ? currentUserSuperAdmin : currentUserCompanyAdmin;
          }
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
        const rawUser = action.payload.user;
        const role: UserRole = (rawUser?.role as UserRole) || 'SUPER_ADMIN';
        state.userRole = role;
        state.currentUser = {
          id: rawUser?.id ? String(rawUser.id) : (role === 'SUPER_ADMIN' ? 'admin_1' : 'cmp_1'),
          name: rawUser?.full_name || (role === 'SUPER_ADMIN' ? 'Super Admin' : 'Company Admin'),
          email: rawUser?.email || action.payload.email,
          role: role,
          companyId: rawUser?.company_id ? String(rawUser.company_id) : undefined,
          companyName: rawUser?.company_name || (role === 'SUPER_ADMIN' ? 'Platform HQ' : 'Company Portal'),
          avatar: role === 'SUPER_ADMIN'
            ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
          portalAccess: rawUser?.portal_access,
          portal_access: rawUser?.portal_access,
          permissions: rawUser?.permissions,
        };
        if (typeof window !== 'undefined') {
          localStorage.setItem('hazree_user_role', role);
          localStorage.setItem('hazree_current_user', JSON.stringify(state.currentUser));
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
