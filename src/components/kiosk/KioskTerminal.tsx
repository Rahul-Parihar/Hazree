"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  AlertCircle,
  Delete,
  ArrowLeft,
} from "lucide-react";
import { EmployeeProfile } from "../../types/customer";
import { useCustomerApp } from "../../context/CustomerAppContext";
import { useLiveClock } from "../../hooks/useLiveClock";
import { employeeService } from "../../services";

interface KioskTerminalProps {
  onExitKiosk: () => void;
}

export default function KioskTerminal({ onExitKiosk }: KioskTerminalProps) {
  const { employees, recordPunch } = useCustomerApp();
  const { formattedTime } = useLiveClock();
  const [pin, setPin] = useState<string>("");
  const [successEmp, setSuccessEmp] = useState<EmployeeProfile | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      setErrorMsg("");

      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setErrorMsg("");
  };

  const handleClear = () => {
    setPin("");
    setErrorMsg("");
  };

  const verifyPin = (pinToTest: string) => {
    setIsVerifying(true);
    setTimeout(() => {
      const matched = employeeService.verifyPin(pinToTest);
      if (matched) {
        setSuccessEmp(matched);
        recordPunch("Kiosk PIN", "Inside", 8);
        setPin("");
        setTimeout(() => {
          setSuccessEmp(null);
        }, 3500);
      } else {
        setErrorMsg("Invalid PIN. Please re-enter your 4-digit code.");
        setPin("");
      }
      setIsVerifying(false);
    }, 500);
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      {/* Top Bar for Kiosk */}
      <div className="w-full max-w-md mb-4 flex items-center justify-between">
        <button
          onClick={onExitKiosk}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-300 hover:text-white"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit Kiosk Mode</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>KIOSK TERMINAL ACTIVE</span>
        </div>
      </div>

      {/* Main Kiosk Card */}
      <div className="w-full max-w-md rounded-3xl bg-slate-900/95 border border-white/15 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl space-y-6 text-center">
        {/* Clock Header */}
        <div className="space-y-1">
          <p className="text-xs text-slate-400 font-mono uppercase tracking-widest">
            Front-Desk Reception Check-In
          </p>
          <div className="text-4xl font-black font-mono text-white tracking-tight">
            {formattedTime}
          </div>
          <p className="text-xs text-slate-400">
            Enter your 4-digit employee PIN to punch Hazree
          </p>
        </div>

        {/* PIN Indicators */}
        <div className="flex justify-center items-center gap-4 py-2">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-5 h-5 rounded-full border-2 transition-all ${
                pin.length > idx
                  ? "bg-emerald-400 border-emerald-400 shadow-lg shadow-emerald-400/50 scale-110"
                  : "bg-slate-800 border-slate-700"
              }`}
            ></div>
          ))}
        </div>

        {errorMsg && (
          <p className="text-xs text-rose-400 flex items-center justify-center gap-1.5 animate-fade-in">
            <AlertCircle className="w-3.5 h-3.5" /> {errorMsg}
          </p>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
            <button
              key={digit}
              onClick={() => handleKeyPress(digit)}
              className="h-14 rounded-2xl bg-slate-800/90 hover:bg-slate-750 active:bg-emerald-500 active:text-slate-950 border border-white/10 text-xl font-bold font-mono text-white shadow-md transition-all active:scale-95 flex items-center justify-center"
            >
              {digit}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="h-14 rounded-2xl bg-slate-800/50 hover:bg-slate-800 border border-white/10 text-xs font-semibold text-slate-400 flex items-center justify-center active:scale-95"
          >
            CLEAR
          </button>
          <button
            onClick={() => handleKeyPress("0")}
            className="h-14 rounded-2xl bg-slate-800/90 hover:bg-slate-750 active:bg-emerald-500 active:text-slate-950 border border-white/10 text-xl font-bold font-mono text-white shadow-md transition-all active:scale-95 flex items-center justify-center"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-14 rounded-2xl bg-slate-800/50 hover:bg-slate-800 border border-white/10 text-slate-300 flex items-center justify-center active:scale-95"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Demo PIN hints */}
        <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 text-[11px] text-slate-400 space-y-1">
          <p className="font-semibold text-slate-300">Quick Demo PINs:</p>
          <div className="flex justify-center gap-4 text-xs font-mono text-emerald-400">
            <span>Aarav: <strong>1234</strong></span>
            <span>Priya: <strong>4321</strong></span>
            <span>Rohan: <strong>7890</strong></span>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {successEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-emerald-500/40 p-8 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-emerald-500/10">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider font-mono">
                Hazree Verified!
              </span>
              <h3 className="text-xl font-bold text-white mt-1">
                Namaste, {successEmp.fullName}!
              </h3>
              <p className="text-xs text-slate-400">
                {successEmp.designation} • {successEmp.employeeCode}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-white/10 text-xs font-mono text-emerald-300">
              Punch Recorded at {formattedTime}
            </div>

            <p className="text-[11px] text-slate-400">
              Thank you! Have a productive shift at {successEmp.companyName}.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
