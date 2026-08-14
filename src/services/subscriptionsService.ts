import { apiClient } from './api/apiClient';
import { ENDPOINTS } from './api/endpoints';

export interface BackendSubscriptionPlan {
  id: number;
  name: string;
  code: string;
  tagline?: string;
  badge_text?: string;
  price_amount: string;
  currency: string;
  billing_cycle: string;
  max_employees: number;
  is_popular: boolean;
  is_active: boolean;
  theme_color: string;
  features: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateSubscriptionPlanInput {
  name: string;
  code?: string;
  tagline?: string;
  badge_text?: string;
  price_amount: string;
  currency?: string;
  billing_cycle?: string;
  max_employees: number;
  is_popular?: boolean;
  is_active?: boolean;
  theme_color?: string;
  features: string[];
}

export const subscriptionsService = {
  async getPlans(): Promise<BackendSubscriptionPlan[]> {
    return apiClient.get<BackendSubscriptionPlan[]>(ENDPOINTS.SUBSCRIPTIONS.PLANS);
  },

  async getPlanById(id: number | string): Promise<BackendSubscriptionPlan> {
    return apiClient.get<BackendSubscriptionPlan>(ENDPOINTS.SUBSCRIPTIONS.GET_PLAN(id));
  },

  async createPlan(input: CreateSubscriptionPlanInput): Promise<BackendSubscriptionPlan> {
    return apiClient.post<BackendSubscriptionPlan>(ENDPOINTS.SUBSCRIPTIONS.CREATE_PLAN, input);
  },

  async updatePlan(id: number | string, input: Partial<CreateSubscriptionPlanInput>): Promise<BackendSubscriptionPlan> {
    return apiClient.put<BackendSubscriptionPlan>(ENDPOINTS.SUBSCRIPTIONS.UPDATE_PLAN(id), input);
  },

  async deletePlan(id: number | string): Promise<{ status: string; message: string }> {
    return apiClient.delete<{ status: string; message: string }>(ENDPOINTS.SUBSCRIPTIONS.DELETE_PLAN(id));
  },
};
