import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hazree | Smart Geofence Attendance & Employee Self-Service",
  description:
    "Next-generation workforce attendance suite with GPS Geofencing, AI Face & Selfie verification, shift rostering, and 1-click payroll integration.",
  keywords: [
    "Attendance Management",
    "Employee Self Service",
    "GPS Geofencing",
    "Biometric Kiosk",
    "Workforce Management",
    "Payroll Attendance",
    "Hazree",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-[#080c14] text-slate-100 selection:bg-emerald-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
