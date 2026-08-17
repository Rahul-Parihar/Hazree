import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import attendanceReducer from "./slices/attendanceSlice";
import leavesReducer from "./slices/leavesSlice";
import uiReducer from "./slices/uiSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      attendance: attendanceReducer,
      leaves: leavesReducer,
      ui: uiReducer,
    },
    devTools: process.env.NODE_ENV !== "production",
  });
};

export const store = makeStore();

export type AppStore = typeof store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
