import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Company, CompanyStatus } from '../../types';
import { companiesService, BackendCompanyCreate } from '../../services';

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
      if (state.auth?.userRole && state.auth.userRole !== 'SUPER_ADMIN') {
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
        state.isLoading = true;
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


