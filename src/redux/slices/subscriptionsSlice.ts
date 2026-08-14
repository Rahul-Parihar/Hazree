import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { subscriptionsService, BackendSubscriptionPlan, CreateSubscriptionPlanInput } from '../../services';

interface SubscriptionsState {
  plans: BackendSubscriptionPlan[];
  isLoading: boolean;
  error: string | null;
}

const initialState: SubscriptionsState = {
  plans: [],
  isLoading: false,
  error: null,
};

export const fetchSubscriptionPlansAsync = createAsyncThunk(
  'subscriptions/fetchPlans',
  async (_, { rejectWithValue }) => {
    try {
      const plans = await subscriptionsService.getPlans();
      return plans;
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to fetch subscription plans');
    }
  }
);

export const createSubscriptionPlanAsync = createAsyncThunk(
  'subscriptions/createPlan',
  async (input: CreateSubscriptionPlanInput, { rejectWithValue }) => {
    try {
      const created = await subscriptionsService.createPlan(input);
      return created;
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to create subscription plan');
    }
  }
);

export const deleteSubscriptionPlanAsync = createAsyncThunk(
  'subscriptions/deletePlan',
  async (id: number | string, { rejectWithValue }) => {
    try {
      await subscriptionsService.deletePlan(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to delete subscription plan');
    }
  }
);

export const subscriptionsSlice = createSlice({
  name: 'subscriptions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Plans
      .addCase(fetchSubscriptionPlansAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptionPlansAsync.fulfilled, (state, action: PayloadAction<BackendSubscriptionPlan[]>) => {
        state.isLoading = false;
        state.plans = action.payload;
      })
      .addCase(fetchSubscriptionPlansAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create Plan
      .addCase(createSubscriptionPlanAsync.fulfilled, (state, action: PayloadAction<BackendSubscriptionPlan>) => {
        state.plans.push(action.payload);
      })
      // Delete Plan
      .addCase(deleteSubscriptionPlanAsync.fulfilled, (state, action) => {
        state.plans = state.plans.filter((p) => p.id !== Number(action.payload) && p.id !== action.payload);
      });
  },
});

export default subscriptionsSlice.reducer;
