import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import companiesReducer from './slices/companiesSlice';
import attendanceReducer from './slices/attendanceSlice';
import employeesReducer from './slices/employeesSlice';
import leavesReducer from './slices/leavesSlice';
import settingsReducer from './slices/settingsSlice';
import subscriptionsReducer from './slices/subscriptionsSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      companies: companiesReducer,
      attendance: attendanceReducer,
      employees: employeesReducer,
      leaves: leavesReducer,
      settings: settingsReducer,
      subscriptions: subscriptionsReducer,
    },
    devTools: process.env.NODE_ENV !== 'production',
  });
};

export const store = makeStore();

export type AppStore = typeof store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
