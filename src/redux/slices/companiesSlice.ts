import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Company, CompanyStatus } from '../../types';
import { initialCompanies } from '../../lib/mockData';
import { companiesService, BackendCompanyCreate } from '../../services';

interface CompaniesState {
  companies: Company[];
  selectedCompanyId: string | null;
  searchQuery: string;
  statusFilter: string;
  isLoading: boolean;
  error: string | null;
}

const initialState: CompaniesState = {
  companies: initialCompanies,
  selectedCompanyId: 'cmp_101',
  searchQuery: '',
  statusFilter: 'ALL',
  isLoading: false,
  error: null,
};

/**
 * Async Thunk to fetch companies from FastAPI backend
 */
export const fetchCompaniesAsync = createAsyncThunk(
  'companies/fetchCompanies',
  async (_, { rejectWithValue }) => {
    try {
      const backendCompanies = await companiesService.getAllCompanies();
      if (backendCompanies && backendCompanies.length > 0) {
        // Map backend schema to frontend Company format
        const mapped: Company[] = backendCompanies.map((bc) => ({
          id: `cmp_${bc.id}`,
          name: bc.name,
          code: bc.code,
          adminName: bc.name + ' Admin',
          adminEmail: bc.email || 'admin@company.com',
          adminPhone: bc.phone || '+91 98000 00000',
          plan: 'Growth',
          status: bc.is_active ? 'Active' : 'Suspended',
          employeeCount: 25,
          maxEmployees: 100,
          createdAt: bc.created_at ? bc.created_at.split('T')[0] : '2026-08-12',
          location: 'Mumbai, India',
          renewalDate: '2027-08-12',
        }));
        return mapped;
      }
      return initialCompanies;
    } catch (err: any) {
      // Fallback gracefully to mock data when backend is not connected
      return initialCompanies;
    }
  }
);

/**
 * Async Thunk to register a company on backend
 */
export const createCompanyAsync = createAsyncThunk(
  'companies/createCompany',
  async (newCompany: Company, { rejectWithValue }) => {
    try {
      const payload: BackendCompanyCreate = {
        name: newCompany.name,
        code: newCompany.code,
        email: newCompany.adminEmail,
        phone: newCompany.adminPhone,
        is_active: newCompany.status === 'Active',
      };
      await companiesService.createCompany(payload);
      return newCompany;
    } catch (err: any) {
      // If backend fails, still return newCompany so frontend demo continues seamlessly
      return newCompany;
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
  },
  extraReducers: (builder) => {
    builder
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
        state.error = action.error.message || 'Failed to fetch companies';
      })
      .addCase(createCompanyAsync.fulfilled, (state, action) => {
        state.companies.unshift(action.payload);
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
} = companiesSlice.actions;

export default companiesSlice.reducer;

