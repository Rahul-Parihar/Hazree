import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ToastNotification {
  id: string;
  text: string;
  type: "success" | "info" | "error";
}

export interface UiState {
  toasts: ToastNotification[];
  activeNav: string;
  sidebarCollapsed: boolean;
}

const initialState: UiState = {
  toasts: [],
  activeNav: "dashboard",
  sidebarCollapsed: false,
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    showToast: (
      state,
      action: PayloadAction<{
        text: string;
        type?: "success" | "info" | "error";
      }>
    ) => {
      const newToast: ToastNotification = {
        id: `${Date.now()}-${Math.random()}`,
        text: action.payload.text,
        type: action.payload.type || "success",
      };
      state.toasts.push(newToast);
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    setActiveNav: (state, action: PayloadAction<string>) => {
      state.activeNav = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
  },
});

export const { showToast, removeToast, setActiveNav, toggleSidebar } =
  uiSlice.actions;

export default uiSlice.reducer;
