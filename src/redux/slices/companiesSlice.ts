import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Company, CompanyStatus } from '../../types';
import { companiesService, BackendCompanyCreate, BackendCompanyUpdate } from '../../services';

interface CompaniesState {
  companies: Company[];
  selectedCompanyId: string | null;
  searchQuery: string;
  statusFilter: string;
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: CompaniesState = {
  companies: [],
  selectedCompanyId: null,
  searchQuery: '',
  statusFilter: 'ALL',
  isLoading: false,
  isCreating: false,
  error: null,
  successMessage: null,
};

/**
 * Async Thunk to fetch companies from FastAPI PostgreSQL backend
 */
export const fetchCompaniesAsync = createAsyncThunk(
  'companies/fetchCompanies',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const userRole = state.auth?.userRole;
      const currentUser = state.auth?.currentUser;

      if (userRole && userRole !== 'SUPER_ADMIN') {
        const myCompId = currentUser?.companyId ? String(currentUser.companyId).replace('cmp_', '') : undefined;
        if (myCompId) {
          const singleCompany = await companiesService.getCompanyById(myCompId);
          if (singleCompany) {
            const mapped: Company[] = [
              {
                id: `cmp_${singleCompany.id}`,
                name: singleCompany.name,
                adminName: singleCompany.admin_name || `${singleCompany.name} Admin`,
                adminEmail: singleCompany.email || '',
                adminPhone: singleCompany.phone || '',
                plan: (singleCompany.plan as any) || 'Growth',
                status: (singleCompany.status as any) || (singleCompany.is_active ? 'Active' : 'Suspended'),
                employeeCount: singleCompany.employee_count || 0,
                maxEmployees: singleCompany.max_employees || 100,
                createdAt: singleCompany.created_at ? singleCompany.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
                location: singleCompany.location || 'Mumbai, MH',
                renewalDate: singleCompany.renewal_date ? singleCompany.renewal_date.split('T')[0] : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                logo: singleCompany.logo,
                daysUntilRenewal: singleCompany.days_until_renewal,
                isSubscriptionExpiringSoon: singleCompany.is_subscription_expiring_soon,
                isSubscriptionExpired: singleCompany.is_subscription_expired,
                subscriptionAlert: singleCompany.subscription_alert,
                subscriptionAlertType: singleCompany.subscription_alert_type,
                shiftCount: singleCompany.shift_count || 3,
                shiftType: singleCompany.shift_type || '3 Shifts • 8 Hours (24x7 Rotational)',
                shiftTimings: singleCompany.shift_timings || 'Shift 1: 06:00 AM - 02:00 PM (8h) | Shift 2: 02:00 PM - 10:00 PM (8h) | Shift 3: 10:00 PM - 06:00 AM (8h)',
                saturdayPolicy: singleCompany.saturday_policy || 'ALL_WORKING',
              },
            ];
            return mapped;
          }
        }
        return [];
      }

      const backendCompanies = await companiesService.getAllCompanies();
      if (Array.isArray(backendCompanies)) {
        if (backendCompanies.length > 0) {
          // Map backend schema to frontend Company format
          const mapped: Company[] = backendCompanies.map((bc) => ({
            id: `cmp_${bc.id}`,
            name: bc.name,
            adminName: bc.admin_name || `${bc.name} Admin`,
            adminEmail: bc.email || '',
            adminPhone: bc.phone || '',
            plan: (bc.plan as any) || 'Growth',
            status: (bc.status as any) || (bc.is_active ? 'Active' : 'Suspended'),
            employeeCount: bc.employee_count || 0,
            maxEmployees: bc.max_employees || 100,
            createdAt: bc.created_at ? bc.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
            location: bc.location || 'Mumbai, MH',
            renewalDate: bc.renewal_date ? bc.renewal_date.split('T')[0] : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            logo: bc.logo,
            daysUntilRenewal: bc.days_until_renewal,
            isSubscriptionExpiringSoon: bc.is_subscription_expiring_soon,
            isSubscriptionExpired: bc.is_subscription_expired,
            subscriptionAlert: bc.subscription_alert,
            subscriptionAlertType: bc.subscription_alert_type,
            shiftCount: bc.shift_count || 3,
            shiftType: bc.shift_type || '3 Shifts • 8 Hours (24x7 Rotational)',
            shiftTimings: bc.shift_timings || 'Shift 1: 06:00 AM - 02:00 PM (8h) | Shift 2: 02:00 PM - 10:00 PM (8h) | Shift 3: 10:00 PM - 06:00 AM (8h)',
            saturdayPolicy: bc.saturday_policy || 'ALL_WORKING',
          }));
          return mapped;
        }
        return [];
      }
      return [];
    } catch (err: any) {
      if (err?.status !== 403 && err?.status !== 401) {
        console.warn('Backend fetch failed:', err?.message);
      }
      return [];
    }
  }
);

/**
 * Async Thunk to register a company on FastAPI backend
 */
export const createCompanyAsync = createAsyncThunk(
  'companies/createCompany',
  async (
    newCompany: Omit<Company, 'id' | 'createdAt'> & { id?: string },
    { rejectWithValue }
  ) => {
    try {
      const payload: BackendCompanyCreate = {
        name: newCompany.name.trim(),
        admin_name: newCompany.adminName?.trim(),
        email: newCompany.adminEmail?.trim().toLowerCase(),
        phone: newCompany.adminPhone?.trim(),
        password: newCompany.password?.trim(),
        plan: newCompany.plan,
        status: newCompany.status,
        location: newCompany.location?.trim(),
        max_employees: newCompany.maxEmployees,
        employee_count: newCompany.employeeCount || 0,
        renewal_date: newCompany.renewalDate,
        logo: newCompany.logo,
        shift_count: newCompany.shiftCount || 1,
        shift_type: newCompany.shiftType || '1 Shift (General Day)',
        shift_timings: newCompany.shiftTimings,
        saturday_policy: newCompany.saturdayPolicy || 'ALL_WORKING',
        is_active: newCompany.status === 'Active',
      };
      const created = await companiesService.createCompany(payload);

      const mapped: Company = {
        id: `cmp_${created.id}`,
        name: created.name,
        adminName: created.admin_name || newCompany.adminName || `${created.name} Admin`,
        adminEmail: created.email || newCompany.adminEmail || '',
        adminPhone: created.phone || newCompany.adminPhone || '',
        plan: (created.plan as any) || newCompany.plan || 'Growth',
        status: (created.status as any) || (created.is_active ? 'Active' : 'Suspended'),
        employeeCount: created.employee_count ?? newCompany.employeeCount ?? 0,
        maxEmployees: created.max_employees ?? newCompany.maxEmployees ?? 100,
        createdAt: created.created_at
          ? created.created_at.split('T')[0]
          : new Date().toISOString().split('T')[0],
        location: created.location || newCompany.location || 'Mumbai, MH',
        renewalDate: created.renewal_date
          ? created.renewal_date.split('T')[0]
          : (newCompany.renewalDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
        logo: created.logo || newCompany.logo,
        shiftCount: created.shift_count || newCompany.shiftCount || 1,
        shiftType: created.shift_type || newCompany.shiftType || '1 Shift (General Day)',
        shiftTimings: created.shift_timings || newCompany.shiftTimings,
        saturdayPolicy: created.saturday_policy || newCompany.saturdayPolicy || 'ALL_WORKING',
        daysUntilRenewal: created.days_until_renewal,
        isSubscriptionExpiringSoon: created.is_subscription_expiring_soon,
        isSubscriptionExpired: created.is_subscription_expired,
        subscriptionAlert: created.subscription_alert,
        subscriptionAlertType: created.subscription_alert_type,
      };

      return mapped;
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to register company on server.';
      return rejectWithValue(errorMsg);
    }
  }
);

/**
 * Async Thunk to update company status (e.g., Suspend or Activate) with optional reason
 */
export const updateCompanyStatusAsync = createAsyncThunk(
  'companies/updateCompanyStatus',
  async (
    {
      id,
      status,
      reason,
      notes,
    }: {
      id: string;
      status: CompanyStatus;
      reason?: string;
      notes?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const rawId = id.replace('cmp_', '');
      await companiesService.updateCompany(rawId, {
        status,
        is_active: status === 'Active',
      });
      return { id, status, reason, notes };
    } catch (err: any) {
      console.warn('Backend updateCompanyStatus warning:', err?.message);
      // Fallback for optimistic state update
      return { id, status, reason, notes };
    }
  }
);

/**
 * Async Thunk to update company details on FastAPI backend
 */
export const updateCompanyAsync = createAsyncThunk(
  'companies/updateCompanyAsync',
  async (
    {
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Company>;
    },
    { rejectWithValue }
  ) => {
    try {
      const rawId = id.replace('cmp_', '');
      const payload: BackendCompanyUpdate = {
        name: updates.name?.trim(),
        admin_name: updates.adminName?.trim(),
        email: updates.adminEmail?.trim().toLowerCase(),
        phone: updates.adminPhone?.trim(),
        password: updates.password?.trim() || undefined,
        plan: updates.plan,
        status: updates.status,
        location: updates.location?.trim(),
        max_employees: updates.maxEmployees,
        employee_count: updates.employeeCount,
        renewal_date: updates.renewalDate,
        logo: updates.logo,
        shift_count: updates.shiftCount,
        shift_type: updates.shiftType,
        shift_timings: updates.shiftTimings,
        saturday_policy: updates.saturdayPolicy,
        is_active: updates.status ? updates.status === 'Active' : undefined,
      };

      const updated = await companiesService.updateCompany(rawId, payload);
      const mapped: Company = {
        id: `cmp_${updated.id}`,
        name: updated.name,
        adminName: updated.admin_name || updates.adminName || `${updated.name} Admin`,
        adminEmail: updated.email || updates.adminEmail || '',
        adminPhone: updated.phone || updates.adminPhone || '',
        plan: (updated.plan as any) || updates.plan || 'Growth',
        status: (updated.status as any) || (updated.is_active ? 'Active' : 'Suspended'),
        employeeCount: updated.employee_count ?? updates.employeeCount ?? 0,
        maxEmployees: updated.max_employees ?? updates.maxEmployees ?? 100,
        createdAt: updated.created_at ? updated.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        location: updated.location || updates.location || 'Mumbai, MH',
        renewalDate: updated.renewal_date ? updated.renewal_date.split('T')[0] : (updates.renewalDate || new Date().toISOString().split('T')[0]),
        logo: updated.logo || updates.logo,
        shiftCount: updated.shift_count || updates.shiftCount || 1,
        shiftType: updated.shift_type || updates.shiftType || '1 Shift (General Day)',
        shiftTimings: updated.shift_timings || updates.shiftTimings,
        saturdayPolicy: updated.saturday_policy || updates.saturdayPolicy || 'ALL_WORKING',
        daysUntilRenewal: updated.days_until_renewal,
        isSubscriptionExpiringSoon: updated.is_subscription_expiring_soon,
        isSubscriptionExpired: updated.is_subscription_expired,
        subscriptionAlert: updated.subscription_alert,
        subscriptionAlertType: updated.subscription_alert_type,
      };
      return mapped;
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to update company.');
    }
  }
);

/**
 * Async Thunk to delete a company from backend
 */
export const deleteCompanyAsync = createAsyncThunk(
  'companies/deleteCompany',
  async (companyId: string, { rejectWithValue }) => {
    try {
      const rawId = companyId.replace('cmp_', '');
      await companiesService.deleteCompany(rawId);
      return companyId;
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to delete company.');
    }
  }
);

export const companiesSlice = createSlice({
  name: 'companies',
  initialState,
  reducers: {
    addCompany: (state, action: PayloadAction<Company>) => {
      state.companies.unshift(action.payload);
    },
    updateCompanyStatus: (
      state,
      action: PayloadAction<{ id: string; status: CompanyStatus }>
    ) => {
      const company = state.companies.find((c) => c.id === action.payload.id);
      if (company) {
        company.status = action.payload.status;
      }
    },
    updateCompany: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<Company> }>
    ) => {
      const index = state.companies.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        state.companies[index] = { ...state.companies[index], ...action.payload.updates };
      }
    },
    deleteCompany: (state, action: PayloadAction<string>) => {
      state.companies = state.companies.filter((c) => c.id !== action.payload);
    },
    setSelectedCompanyId: (state, action: PayloadAction<string | null>) => {
      state.selectedCompanyId = action.payload;
    },
    setCompanySearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setCompanyStatusFilter: (state, action: PayloadAction<string>) => {
      state.statusFilter = action.payload;
    },
    clearCompanyError: (state) => {
      state.error = null;
    },
    clearCompanySuccess: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Companies
      .addCase(fetchCompaniesAsync.pending, (state) => {
        if (state.companies.length === 0) {
          state.isLoading = true;
        }
        state.error = null;
      })
      .addCase(fetchCompaniesAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.companies = action.payload;
      })
      .addCase(fetchCompaniesAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || action.error.message || 'Failed to fetch companies';
      })
      // Create Company
      .addCase(createCompanyAsync.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createCompanyAsync.fulfilled, (state, action) => {
        state.isCreating = false;
        state.companies.unshift(action.payload);
        state.successMessage = `Company "${action.payload.name}" registered successfully!`;
      })
      .addCase(createCompanyAsync.rejected, (state, action) => {
        state.isCreating = false;
        state.error = (action.payload as string) || 'Failed to register company.';
      })
      // Update Company Details
      .addCase(updateCompanyAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCompanyAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.companies.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.companies[index] = action.payload;
        }
        state.successMessage = `Company "${action.payload.name}" updated successfully!`;
      })
      .addCase(updateCompanyAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || 'Failed to update company details.';
      })
      // Update Company Status (Suspend / Activate)
      .addCase(updateCompanyStatusAsync.fulfilled, (state, action) => {
        const company = state.companies.find((c) => c.id === action.payload.id);
        if (company) {
          company.status = action.payload.status;
          state.successMessage =
            action.payload.status === 'Suspended'
              ? `Organization "${company.name}" has been suspended. (${action.payload.reason || 'Reason recorded'})`
              : `Organization "${company.name}" has been activated successfully!`;
        }
      })
      // Delete Company
      .addCase(deleteCompanyAsync.fulfilled, (state, action) => {
        state.companies = state.companies.filter((c) => c.id !== action.payload);
      });
  },
});

export const {
  addCompany,
  updateCompanyStatus,
  updateCompany,
  deleteCompany,
  setSelectedCompanyId,
  setCompanySearchQuery,
  setCompanyStatusFilter,
  clearCompanyError,
  clearCompanySuccess,
} = companiesSlice.actions;

export default companiesSlice.reducer;


