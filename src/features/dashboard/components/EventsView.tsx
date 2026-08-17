"use client";

import React, { useState } from "react";
import {
  Plus,
  Download,
  Search,
  Filter,
  List,
  Calendar as CalendarIcon,
  User as UserIcon,
  MoreVertical,
  ChevronDown,
  X,
  MapPin,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { useCustomerApp } from "@/context/CustomerAppContext";

interface EventItem {
  id: string;
  title: string;
  category: string;
  startDateTime: string;
  endDateTime: string;
  where: string;
  status: "Upcoming" | "Completed" | "Ongoing";
  attendeesCount: number;
  description: string;
}

export default function EventsView() {
  const { activeEmployee, showToast } = useCustomerApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "calendar" | "cards">("table");
  const [selectedEventModal, setSelectedEventModal] = useState<EventItem | null>(null);

  // New Event Form State
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Workshop");
  const [newStartDate, setNewStartDate] = useState("2026-08-25");
  const [newStartTime, setNewStartTime] = useState("03:00 PM");
  const [newEndDate, setNewEndDate] = useState("2026-08-25");
  const [newEndTime, setNewEndTime] = useState("06:00 PM");
  const [newWhere, setNewWhere] = useState("Auditorium Floor 2");
  const [newDescription, setNewDescription] = useState("");

  const [eventsList, setEventsList] = useState<EventItem[]>([
    {
      id: "1",
      title: "Hazree Tech Summit & AI Innovation Showcase 2026",
      category: "Workshop",
      startDateTime: "25-08-2026 03:00 PM",
      endDateTime: "25-08-2026 06:00 PM",
      where: "Main Auditorium & Hybrid Stream",
      status: "Upcoming",
      attendeesCount: 48,
      description:
        "Flagship annual technical summit showcasing high-performance backend architectures, real-time geofencing algorithms, and AI workforce optimizations.",
    },
    {
      id: "2",
      title: "Quarterly All-Hands Town Hall (Q3 Review & Roadmap)",
      category: "Town Hall",
      startDateTime: "29-08-2026 11:00 AM",
      endDateTime: "29-08-2026 12:30 PM",
      where: "Conference Hall A",
      status: "Upcoming",
      attendeesCount: 76,
      description:
        "Quarterly company-wide meeting discussing Q3 milestones, customer growth metrics, upcoming mobile app releases, and employee awards recognition.",
    },
    {
      id: "3",
      title: "Independence Day Cultural Fest & Team Lunch",
      category: "Celebration",
      startDateTime: "15-08-2026 10:00 AM",
      endDateTime: "15-08-2026 02:00 PM",
      where: "Hazree HQ Rooftop Lounge",
      status: "Completed",
      attendeesCount: 92,
      description:
        "Celebrating 79th Independence Day with national anthem, employee cultural performances, fun team games, and special luncheon.",
    },
    {
      id: "4",
      title: "FastAPI & Microservices Architecture Masterclass",
      category: "Workshop",
      startDateTime: "05-09-2026 04:30 PM",
      endDateTime: "05-09-2026 06:00 PM",
      where: "Training Room 302",
      status: "Upcoming",
      attendeesCount: 34,
      description:
        "Hands-on architectural deep dive on scaling high-throughput attendance event processing with asynchronous FastAPI and background workers.",
    },
    {
      id: "5",
      title: "Annual Team Outing & Adventure Retreat",
      category: "Team Outing",
      startDateTime: "18-09-2026 08:00 AM",
      endDateTime: "18-09-2026 08:00 PM",
      where: "Grand Valley Eco Resort",
      status: "Upcoming",
      attendeesCount: 85,
      description:
        "A full-day team rejuvenation outing featuring team-building sports, outdoor trekking, networking sessions, and musical evening dinner.",
    },
  ]);

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newEvt: EventItem = {
      id: String(Date.now()),
      title: newTitle.trim(),
      category: newCategory,
      startDateTime: `${newStartDate} ${newStartTime}`,
      endDateTime: `${newEndDate} ${newEndTime}`,
      where: newWhere || "Conference Hall",
      status: "Upcoming",
      attendeesCount: 1,
      description: newDescription || "Scheduled event.",
    };

    setEventsList([newEvt, ...eventsList]);
    setIsAddModalOpen(false);
    setNewTitle("");
    setNewDescription("");
    showToast(`Event "${newEvt.title}" created successfully!`, "success");
  };

  const handleExport = () => {
    const header = "Event Name,Category,Start Date & Time,End Date & Time,Where,Status";
    const rows = eventsList.map(
      (e) => `"${e.title}","${e.category}","${e.startDateTime}","${e.endDateTime}","${e.where}","${e.status}"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [header, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Events_Schedule.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredEvents = eventsList.filter((e) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      e.title.toLowerCase().includes(q) ||
      e.where.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q) ||
      e.startDateTime.includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* 1. Filter / Search Strip (Matching Screenshot Pattern) */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 px-5 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-6">
          {/* Duration */}
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

          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Start typing to search"
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs w-60"
            />
          </div>
        </div>

        {/* Filters Button */}
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors">
          <Filter className="w-3.5 h-3.5" />
          <span>Filters</span>
        </button>
      </div>

      {/* 2. Action Bar: + Add Event & Export (Left), View Switchers (Right) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {/* Add Event Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Event</span>
          </button>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Export</span>
          </button>
        </div>

        {/* View Switchers */}
        <div className="flex items-center bg-white border border-slate-300 rounded-lg p-0.5 shadow-xs overflow-hidden">
          <button
            onClick={() => setViewMode("table")}
            className={`p-2 rounded-md transition-colors ${
              viewMode === "table"
                ? "bg-black text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
            title="List Table"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("calendar")}
            className={`p-2 rounded-md transition-colors ${
              viewMode === "calendar"
                ? "bg-black text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
            title="Calendar View"
          >
            <CalendarIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("cards")}
            className={`p-2 rounded-md transition-colors ${
              viewMode === "cards"
                ? "bg-black text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
            title="Profile Cards"
          >
            <UserIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. Main Events Data Table Card */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] text-slate-500 font-semibold border-b border-slate-200">
                <th className="py-3.5 px-4">Event Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Start Date & Time</th>
                <th className="py-3.5 px-4">End Date & Time</th>
                <th className="py-3.5 px-4">Where</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
              {filteredEvents.map((evt) => (
                <tr key={evt.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Event Title */}
                  <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-xs truncate">
                    {evt.title}
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                      {evt.category}
                    </span>
                  </td>

                  {/* Start Date & Time */}
                  <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-700">
                    {evt.startDateTime}
                  </td>

                  {/* End Date & Time */}
                  <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-700">
                    {evt.endDateTime}
                  </td>

                  {/* Where */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                    {evt.where}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                        evt.status === "Upcoming"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          evt.status === "Upcoming" ? "bg-blue-600" : "bg-emerald-600"
                        }`}
                      ></span>
                      <span>{evt.status}</span>
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => setSelectedEventModal(evt)}
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
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer: Show entries & Pagination */}
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
              Showing 1 to {filteredEvents.length} of {filteredEvents.length} entries
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

      {/* Add Event Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 animate-fade-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-sm text-slate-900">Add New Event</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Event Name
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Q3 Town Hall"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>Workshop</option>
                    <option>Town Hall</option>
                    <option>Celebration</option>
                    <option>Team Outing</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Where / Venue
                  </label>
                  <input
                    type="text"
                    required
                    value={newWhere}
                    onChange={(e) => setNewWhere(e.target.value)}
                    placeholder="Conference Room A"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Start Date & Time
                  </label>
                  <input
                    type="date"
                    required
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-1.5"
                  />
                  <input
                    type="text"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    placeholder="10:00 AM"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    End Date & Time
                  </label>
                  <input
                    type="date"
                    required
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-1.5"
                  />
                  <input
                    type="text"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    placeholder="01:00 PM"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Event details..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#1a73e8] hover:bg-[#1557b0] text-white font-semibold shadow-sm"
                >
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Event Detail Modal */}
      {selectedEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 animate-fade-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-sm text-slate-900">Event Details</h3>
              <button
                onClick={() => setSelectedEventModal(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {selectedEventModal.category}
                </span>
                <h4 className="text-base font-bold text-slate-900 mt-2 leading-snug">
                  {selectedEventModal.title}
                </h4>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-slate-700">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>{selectedEventModal.startDateTime} - {selectedEventModal.endDateTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <span>{selectedEventModal.where}</span>
                </div>
              </div>

              <p className="text-slate-600 leading-relaxed">
                {selectedEventModal.description}
              </p>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedEventModal(null)}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-sm"
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
