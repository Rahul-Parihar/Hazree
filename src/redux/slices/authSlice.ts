import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserRole, UserProfile } from '../../types';
import { currentUserSuperAdmin, currentUserCompanyAdmin } from '../../lib/mockData';

interface AuthState {
  userRole: UserRole;
  currentUser: UserProfile;
  isAuthenticated: boolean;
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
};

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
      if (typeof window !== 'undefined') {
        localStorage.removeItem('hazree_user_role');
      }
    },
    updateUserProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      state.currentUser = { ...state.currentUser, ...action.payload };
    },
    initializeAuth: (state) => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('hazree_user_role') as UserRole;
        if (saved && (saved === 'SUPER_ADMIN' || saved === 'COMPANY_ADMIN')) {
          state.userRole = saved;
          state.currentUser = saved === 'SUPER_ADMIN' ? currentUserSuperAdmin : currentUserCompanyAdmin;
        }
      }
    },
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
