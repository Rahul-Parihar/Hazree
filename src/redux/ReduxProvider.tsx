"use client";

import React, { useRef, useEffect } from "react";
import { Provider } from "react-redux";
import { makeStore, AppStore } from "./store";
import { initializeAuth } from "./slices/authSlice";
import { initializeAttendance } from "./slices/attendanceSlice";
import { initializeLeaves } from "./slices/leavesSlice";

export default function ReduxProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  useEffect(() => {
    if (storeRef.current) {
      storeRef.current.dispatch(initializeAuth());
      const state = storeRef.current.getState();
      const empId = state.auth.user?.id;
      storeRef.current.dispatch(initializeAttendance({ employeeId: empId }));
      storeRef.current.dispatch(initializeLeaves({ employeeId: empId }));
    }
  }, []);

  return <Provider store={storeRef.current}>{children}</Provider>;
}
