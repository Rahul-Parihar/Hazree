import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Company, CompanyStatus } from '../../types';
import { initialCompanies } from '../../lib/mockData';

interface CompaniesState {
  companies: Company[];
  selectedCompanyId: string | null;
  searchQuery: string;
  statusFilter: string;
}

const initialState: CompaniesState = {
  companies: initialCompanies,
  selectedCompanyId: 'cmp_101',
  searchQuery: '',
  statusFilter: 'ALL',
};

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
