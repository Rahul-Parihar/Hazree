"use client";

import React, { useState } from "react";
import {
  Search,
  Download,
  MoreVertical,
  Eye,
  X,
  Calendar,
  User,
  Megaphone,
} from "lucide-react";

interface NoticeItem {
  id: string;
  title: string;
  date: string;
  to: string;
  description: string;
}

export default function NoticeBoardView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [selectedNotices, setSelectedNotices] = useState<string[]>([]);
  const [activeNoticeModal, setActiveNoticeModal] = useState<NoticeItem | null>(null);

  const notices: NoticeItem[] = [
    {
      id: "1",
      title: "Mandatory Update: 2nd & 4th Saturdays to be Working Days",
      date: "06-04-2026",
      to: "Employee",
      description:
        "Please note that effective from this month, 2nd and 4th Saturdays will be working days with regular shift timings (09:30 AM to 06:30 PM). Compensatory offs will be adjusted accordingly as per company policy.",
    },
    {
      id: "2",
      title: "Update: 2nd & 4th Saturdays to be Working Days",
      date: "06-04-2026",
      to: "Employee",
      description:
        "This is an operational policy update regarding Saturday work schedules. All team leads are requested to coordinate sprint deliverables.",
    },
    {
      id: "3",
      title:
        "Attention :- You need to update an comment when the task is completed this is called the developer doc Check format",
      date: "09-01-2026",
      to: "Employee",
      description:
        "All engineering members must add code commit references and documentation remarks before marking tasks as completed. Adhere strictly to the developer doc check format.",
    },
    {
      id: "4",
      title: "Cheers to a New Year! 🥂",
      date: "01-01-2026",
      to: "Employee",
      description:
        "Hazree Technologies wishes everyone a prosperous and joyous New Year! May this year bring continuous growth, innovation, and achievements.",
    },
    {
      id: "5",
      title:
        "Important Notice: Leave Restriction from 15th September to 31st October",
      date: "15-09-2025",
      to: "Employee",
      description:
        "Due to upcoming critical enterprise client deployments, planned leaves between September 15 and October 31 will require prior approval from the department head.",
    },
    {
      id: "6",
      title: "Office Timings & Attendance Protocol",
      date: "01-03-2025",
      to: "Employee",
      description:
        "All employees are reminded to mark their punch-in within the geofenced office radius by 09:45 AM. Late punch marks beyond the grace period will automatically deduct half-day quota.",
    },
  ];

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedNotices(notices.map((n) => n.id));
    } else {
      setSelectedNotices([]);
    }
  };

  const handleToggleNotice = (id: string) => {
    if (selectedNotices.includes(id)) {
      setSelectedNotices(selectedNotices.filter((item) => item !== id));
    } else {
      setSelectedNotices([...selectedNotices, id]);
    }
  };

  const handleExport = () => {
    const header = "Notice Title,Date,Target Audience";
    const rows = notices.map((n) => `"${n.title}","${n.date}","${n.to}"`);
    const csvContent = "data:text/csv;charset=utf-8," + [header, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Notice_Board_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredNotices = notices.filter((n) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return n.title.toLowerCase().includes(q) || n.date.includes(q);
  });

  return (
    <div className="space-y-4">
      {/* 1. Filter / Search Strip */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 px-5 py-3 flex flex-wrap items-center gap-6">
        {/* Duration Date Range */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Duration</span>
          <input
            type="text"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            placeholder="Start Date To End Date"
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs w-48"
          />
        </div>

        {/* Search Field */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Start typing to search"
            className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs w-64"
          />
        </div>
      </div>

      {/* 2. Action Bar: Export Button */}
      <div className="flex items-center justify-start">
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 shadow-xs transition-colors"
        >
          <Download className="w-4 h-4 text-slate-600" />
          <span>Export</span>
        </button>
      </div>

      {/* 3. Main Notice Board Table Card */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] text-slate-500 font-semibold border-b border-slate-200">
                <th className="py-3.5 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={
                      selectedNotices.length === notices.length &&
                      notices.length > 0
                    }
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-4 font-semibold text-slate-600">
                  Notice
                </th>
                <th className="py-3.5 px-4 font-semibold text-slate-600 w-32">
                  Date
                </th>
                <th className="py-3.5 px-4 font-semibold text-slate-600 w-28">
                  To
                </th>
                <th className="py-3.5 px-4 font-semibold text-slate-600 text-right w-28">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
              {filteredNotices.map((item) => {
                const isChecked = selectedNotices.includes(item.id);
                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isChecked ? "bg-blue-50/30" : ""
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3.5 px-4">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleNotice(item.id)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>

                    {/* Notice Title */}
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {item.title}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                      {item.date}
                    </td>

                    {/* To Target Audience */}
                    <td className="py-3.5 px-4 font-medium text-slate-700 whitespace-nowrap">
                      {item.to}
                    </td>

                    {/* Actions: View Button & Dropdown */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setActiveNoticeModal(item)}
                          className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-300 rounded text-xs font-semibold text-slate-700 shadow-xs transition-colors"
                        >
                          View
                        </button>
                        <button className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors border border-slate-300">
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span>Show</span>
            <select className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-800 focus:outline-none">
              <option>25</option>
              <option>50</option>
              <option>100</option>
            </select>
            <span>entries</span>
          </div>

          <div className="flex items-center gap-3">
            <span>
              Showing 1 to {filteredNotices.length} of {filteredNotices.length}{" "}
              entries
            </span>
            <div className="flex items-center gap-1">
              <button className="px-3 py-1 bg-white border border-slate-200 rounded text-slate-600 hover:bg-slate-50 disabled:opacity-50">
                Previous
              </button>
              <button className="px-3 py-1 bg-[#1a73e8] text-white font-bold rounded">
                1
              </button>
              <button className="px-3 py-1 bg-white border border-slate-200 rounded text-slate-600 hover:bg-slate-50 disabled:opacity-50">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* View Notice Detail Modal */}
      {activeNoticeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Megaphone className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">
                  Notice Details
                </h3>
              </div>
              <button
                onClick={() => setActiveNoticeModal(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 text-xs">
              <div>
                <h4 className="text-base font-bold text-slate-900 leading-snug">
                  {activeNoticeModal.title}
                </h4>
                <div className="flex items-center gap-4 text-slate-400 mt-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{activeNoticeModal.date}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    <span>To: {activeNoticeModal.to}</span>
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 leading-relaxed text-xs">
                {activeNoticeModal.description}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setActiveNoticeModal(null)}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-sm transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
