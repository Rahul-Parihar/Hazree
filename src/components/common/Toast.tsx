"use client";

import React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { useCustomerApp } from "../../context/CustomerAppContext";

export default function ToastContainer() {
  const { toasts, removeToast } = useCustomerApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === "success";
        const isError = toast.type === "error";

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-2xl text-xs sm:text-sm text-white backdrop-blur-xl animate-fade-in ${
              isSuccess
                ? "bg-slate-900/95 border-emerald-500/40 text-emerald-100"
                : isError
                ? "bg-slate-900/95 border-rose-500/40 text-rose-100"
                : "bg-slate-900/95 border-cyan-500/40 text-cyan-100"
            }`}
          >
            <div
              className={`p-1 rounded-lg ${
                isSuccess
                  ? "bg-emerald-500/20 text-emerald-400"
                  : isError
                  ? "bg-rose-500/20 text-rose-400"
                  : "bg-cyan-500/20 text-cyan-400"
              }`}
            >
              {isSuccess ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : isError ? (
                <AlertCircle className="w-4 h-4" />
              ) : (
                <Info className="w-4 h-4" />
              )}
            </div>

            <span className="font-medium">{toast.text}</span>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white text-xs ml-2 p-1 rounded-lg hover:bg-white/10"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
