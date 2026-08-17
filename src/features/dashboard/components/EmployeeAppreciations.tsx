"use client";

import React from "react";
import { Award, Gift } from "lucide-react";

export function BirthdaysCard() {
  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-5 space-y-3">
      <h3 className="font-bold text-sm text-slate-800 tracking-tight">
        Birthdays
      </h3>

      <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 font-semibold">
            YB
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-800">Mr Yash Bhatewara</p>
            <p className="text-[11px] text-slate-500">Developer</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200">
            <Gift className="w-3 h-3 text-blue-500" />
            27 Aug
          </span>
          <span className="text-[10px] text-slate-400">1 week after</span>
        </div>
      </div>
    </div>
  );
}

export function EmployeeAppreciations() {
  const appreciations = [
    {
      id: 1,
      name: "Mr Anand Patel",
      role: "Tech Lead",
      isYou: true,
      award: "Discipline Star Award",
      date: "09-01-2026",
      color: "pink",
    },
    {
      id: 2,
      name: "Mr Raj Verma",
      role: "Developer",
      isYou: false,
      award: "Star Performer of the Month",
      date: "10-11-2025",
      color: "green",
    },
    {
      id: 3,
      name: "Mr Shubham Parmar",
      role: "Tech Lead",
      isYou: false,
      award: "Star Performer of the Month",
      date: "10-02-2025",
      color: "green",
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-5 space-y-3">
      <h3 className="font-bold text-sm text-slate-800 tracking-tight">
        Employee Appreciations
      </h3>

      <div className="space-y-2.5">
        {appreciations.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 text-xs font-semibold">
                {item.name
                  .replace("Mr ", "")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold text-slate-800">
                    {item.name}
                  </p>
                  {item.isYou && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-800 text-white">
                      It's you
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">{item.role}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-medium text-slate-800">{item.award}</p>
                <p className="text-[10px] text-slate-400 font-mono">{item.date}</p>
              </div>

              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  item.color === "pink"
                    ? "bg-pink-50 text-pink-500 border border-pink-200"
                    : "bg-emerald-50 text-emerald-500 border border-emerald-200"
                }`}
              >
                <Award className="w-4 h-4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EmployeeAppreciations;
