"use client";

import React from "react";
import { useRouter } from "next/navigation";
import LoginPage from "../../components/auth/LoginPage";
import { CustomerAppProvider } from "../../context/CustomerAppContext";

function LoginContent() {
  const router = useRouter();

  const handleLoginSuccess = (email: string) => {
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
