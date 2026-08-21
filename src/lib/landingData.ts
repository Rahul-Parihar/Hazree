import { PricingPlan } from "../types/customer";

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter Free",
    tagline: "Essential attendance tracking for small teams & startups",
    pricePerEmpMonthly: 0,
    billingPeriod: "monthly",
    features: [
      "Up to 10 Employees Free Forever",
      "Web & Mobile GPS Punch In/Out",
      "Office Geofencing (1 Location)",
      "Daily Attendance Summaries",
      "Leave Application & Approvals",
      "Basic CSV/Excel Export",
      "Community Support",
    ],
    recommendedFor: "Startups & Micro Businesses",
    ctaText: "Get Started Free",
  },
  {
    id: "growth",
    name: "Growth Pro",
    tagline: "The #1 automated workforce & shift management suite",
    pricePerEmpMonthly: 49,
    billingPeriod: "monthly",
    popular: true,
    features: [
      "Unlimited Employees & Multi-Branch",
      "AI Selfie & Anti-Spoof Liveness Check",
      "Tablet Front-Desk Kiosk Mode with PIN",
      "Shift Rostering & Night Shift Rules",
      "Overtime & Late-Coming Penalty Rules",
      "Automated WhatsApp & Email Reports",
      "1-Click Payroll Salary Computations",
      "24/7 Priority Support & Dedicated Account Mgr",
    ],
    recommendedFor: "Growing SMEs, Retail & IT Firms",
    ctaText: "Start 14-Day Free Trial",
  },
  {
    id: "enterprise",
    name: "Enterprise Custom",
    tagline: "Tailored biometric sync, custom APIs & dedicated SLAs",
    pricePerEmpMonthly: 99,
    billingPeriod: "monthly",
    features: [
      "Everything in Growth Pro",
      "Hardware Biometric Device Sync (ZKTeco, Realtime)",
      "Custom ERP/HRMS API Webhooks (SAP, Zoho, Darwinbox)",
      "Custom Geofence Polygons & Beacons",
      "Dedicated On-Premise / Private Cloud Option",
      "Custom SLA with 99.99% Uptime Guarantee",
      "Custom Training & Employee Onboarding",
    ],
    recommendedFor: "Large Enterprises, Plants & Chain Stores",
    ctaText: "Contact Enterprise Sales",
  },
];

export const TESTIMONIALS = [
  {
    name: "Vikramaditya Singhal",
    role: "COO, Apex Retailers (42 Outlets)",
    text: "Hazree eliminated buddy punching and saved our retail chain over 180 hours of manual attendance verification every month. The Geofenced kiosk mode is pure gold!",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
    rating: 5,
    stats: "Saved ₹1.8L/month on leakage",
  },
  {
    name: "Ananya Deshmukh",
    role: "Head of HR, Synapse Digital Labs",
    text: "Our engineers love the simple web & mobile selfie punch. Leave requests are approved in seconds and monthly payroll export happens with just one click.",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80",
    rating: 5,
    stats: "100% On-time Salary Disbursal",
  },
  {
    name: "Rajeshwar Guha",
    role: "Plant Director, Everest Packagings",
    text: "Managing 3 rotational shifts across 280 factory workers was a nightmare before Hazree. Now the shift roster and automated overtime tracking work seamlessly.",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80",
    rating: 5,
    stats: "Zero Shift Discrepancies",
  },
];

export const FAQS = [
  {
    question: "How does GPS Geofencing work on mobile and web?",
    answer:
      "Hazree captures device GPS coordinates upon punching and verifies if the employee is physically located within the employer-defined radius (e.g. 50 meters of the office or client site). Punches outside the zone are either flagged or rejected according to company policies.",
  },
  {
    question: "Can we use a single tablet or phone as an office check-in Kiosk?",
    answer:
      "Yes! With Hazree Kiosk Mode, you can mount any standard Android tablet or iPad at your reception/entry. Employees simply enter their 4-digit PIN or scan their QR badge with instant camera verification.",
  },
  {
    question: "Is Hazree compliant with statutory payroll calculations in India?",
    answer:
      "Absolutely. Hazree automatically calculates present days, half days, paid leaves, sandwich holiday rules, and overtime hours, generating ready-to-use payroll spreadsheets compliant with PF/ESIC norms.",
  },
  {
    question: "Can I try Hazree for free before purchasing?",
    answer:
      "Yes! Our Starter plan is 100% free forever for up to 10 employees. For larger teams, you get a full-featured 14-day free trial of the Growth Pro plan with no credit card required.",
  },
];
