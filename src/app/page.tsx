"use client";

import React, { useState } from "react";
import { CustomerAppProvider, useCustomerApp } from "../context/CustomerAppContext";
import ToastContainer from "../components/common/Toast";
import { LoginPage } from "../features/auth";
import { EmployeeDashboardLayout } from "../features/dashboard";
import { EmployeeProfile } from "../types/customer";

function MainContent() {
  const { isAuthenticated, loginUser, logoutUser } = useCustomerApp();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLoginSuccess = (profile: EmployeeProfile) => {
    loginUser(profile);
  };

  const handleLogout = () => {
    logoutUser();
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#e8edf4] flex items-center justify-center">
        <div className="flex items-center gap-3 text-blue-600 font-semibold text-sm">
          <span className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
          <span>Loading Hazree Portal...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="relative">
        <ToastContainer />
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <div className="relative">
      <ToastContainer />
      <EmployeeDashboardLayout onLogout={handleLogout} />
    </div>
  );
}

export default function Home() {
  return (
    <CustomerAppProvider>
      <MainContent />
    </CustomerAppProvider>
  );
}
