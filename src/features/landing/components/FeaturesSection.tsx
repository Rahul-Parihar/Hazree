"use client";

import React from "react";
import {
  MapPin,
  Camera,
  Tv,
  CalendarRange,
  FileCheck2,
  MessageSquare,
  Cpu,
  Calculator,
  ShieldCheck,
  Zap,
} from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      icon: MapPin,
      title: "GPS Geofencing Perimeter",
      description:
        "Define exact office, factory, or client premises coordinates. Disallow check-ins when employees are outside authorized boundaries.",
      badge: "Anti-Spoofing",
    },
    {
      icon: Camera,
      title: "AI Selfie & Face Liveness",
      description:
        "High-accuracy facial recognition & snapshot verification. Eliminates proxy attendance and buddy punching with timestamp audit trails.",
      badge: "Zero Proxy",
    },
    {
      icon: Tv,
      title: "Tablet Front-Desk Kiosk",
      description:
        "Turn any inexpensive tablet or mobile phone into a fast, touch-enabled reception terminal with 4-digit PINs and QR badge scanning.",
      badge: "Hardware-Free",
    },
    {
      icon: CalendarRange,
      title: "Rotational Shifts & Rosters",
      description:
        "Support multi-shift operations, midnight crosses, flexible timing, lunch break deductions, and grace period thresholds.",
      badge: "24/7 Operations",
    },
    {
      icon: FileCheck2,
      title: "Leave Approval Workflow",
      description:
        "Employees request Casual, Sick, or Earned leaves directly. Managers approve in 1 click with automatic quota calculation.",
      badge: "Paperless",
    },
    {
      icon: MessageSquare,
      title: "Daily WhatsApp & Email Digest",
      description:
        "Send automatic morning check-in reminders and daily attendance summary reports to management directly on WhatsApp.",
      badge: "Instant Alerts",
    },
    {
      icon: Cpu,
      title: "Biometric Hardware Sync",
      description:
        "Seamlessly connect ZKTeco, Realtime, eSSL, or Essl biometric fingerprint machines with Hazree Cloud via our secure API bridge.",
      badge: "Hybrid Ready",
    },
    {
      icon: Calculator,
      title: "1-Click Payroll Calculation",
      description:
        "Automatically compute payable days, overtime hours, sandwich rule deductions, and generate PF/ESIC compliant salary sheets.",
      badge: "Instant Export",
    },
  ];

  return (
    <section id="features" className="py-20 bg-slate-950/60 border-y border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Zap className="w-3.5 h-3.5" />
            Built for Modern Workforces
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Everything you need to automate workforce attendance.
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            From remote field teams to factory plant workers, Hazree provides
            enterprise-grade attendance tracking without heavy hardware costs.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 hover:border-emerald-500/40 transition-all duration-300 glass-card-hover group flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-white/5">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-white/5 flex items-center gap-1 text-[11px] text-emerald-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Enterprise Secure</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
