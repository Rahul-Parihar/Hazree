"use client";

import React from "react";
import { Clock, ShieldCheck, Heart, ExternalLink } from "lucide-react";
import { siteConfig } from "../../config/site";

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-white/10 pt-16 pb-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-white/5">
          {/* Col 1 */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-white font-mono tracking-tight">
                {siteConfig.name.toUpperCase()}
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              India's leading Geofenced Attendance, Selfie Verification & Workforce
              Management SaaS platform.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ISO 27001 & GDPR Compliant</span>
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
              Product & Modules
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#features" className="hover:text-white transition-colors">GPS Geofence Tracking</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">AI Selfie Anti-Spoofing</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Tablet Front-Desk Kiosk</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Shift Rostering & Timings</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">1-Click Payroll Calculation</a></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
              Ecosystem
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href={siteConfig.links.admin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300"
                >
                  <span>Company Admin Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.links.docs}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300"
                >
                  <span>FastAPI Swagger Docs</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li><a href="#pricing" className="hover:text-white transition-colors">ROI Calculator & Pricing</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">Help Center & FAQs</a></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
              Compliance & Security
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enterprise grade 256-bit encryption for all GPS audit trails and biometric
              snapshots. Zero unauthorized data sharing.
            </p>
            <div className="pt-1">
              <span className="inline-block px-2.5 py-1 rounded-full bg-slate-900 border border-white/10 text-[10px] text-slate-300 font-mono">
                Server Location: AWS Mumbai (ap-south-1)
              </span>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>© 2026 Hazree Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Built with</span>
            <Heart className="w-3 h-3 text-rose-500 fill-current inline" />
            <span>for high-performance teams.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
