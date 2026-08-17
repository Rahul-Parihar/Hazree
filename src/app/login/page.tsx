"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { LoginPage } from "../../features/auth";
import { CustomerAppProvider, useCustomerApp } from "../../context/CustomerAppContext";
import { EmployeeProfile } from "../../types/customer";

function LoginContent() {
  const router = useRouter();
  const { loginUser } = useCustomerApp();

  const handleLoginSuccess = (profile: EmployeeProfile) => {
    loginUser(profile);
    router.push("/");
  };

  return <LoginPage onLoginSuccess={handleLoginSuccess} />;
}

export default function Page() {
  return (
    <CustomerAppProvider>
      <LoginContent />
    </CustomerAppProvider>
  );
}
