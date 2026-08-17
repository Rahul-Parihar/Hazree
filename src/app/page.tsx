"use client";

import React, { useState } from "react";
import { CustomerAppProvider } from "../context/CustomerAppContext";
import ToastContainer from "../components/common/Toast";
import LoginPage from "../components/auth/LoginPage";
import EmployeeDashboardLayout from "../components/dashboard/EmployeeDashboardLayout";

function MainContent() {
  const [currentView, setCurrentView] = useState<"login" | "dashboard">("login");

  const handleLoginSuccess = (email: string) => {
    setCurrentView("dashboard");
  };

  const handleLogout = () => {
    setCurrentView("login");
  };

  if (currentView === "login") {
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
