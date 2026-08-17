"use client";

import React, { useState } from "react";
import {
  Search,
  Check,
  Eye,
  EyeOff,
  Shuffle,
  HelpCircle,
  Camera,
  Upload,
  User,
  Shield,
  Phone,
  Lock,
} from "lucide-react";
import { useCustomerApp } from "../../context/CustomerAppContext";

export default function ProfileSettingsView() {
  const { activeEmployee, showToast } = useCustomerApp();

  const [activeTab, setActiveTab] = useState<"profile" | "emergency">("profile");
  const [activeNav, setActiveNav] = useState<"profile" | "security">("profile");

  // Form State
  const [salutation, setSalutation] = useState("Mr");
  const [fullName, setFullName] = useState(activeEmployee?.fullName || "Anand Patel");
  const [email, setEmail] = useState(activeEmployee?.email || "anandgt@geegatechnologies.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState<"enable" | "disable">("enable");
  const [googleCalendar, setGoogleCalendar] = useState<"yes" | "no">("yes");
  const [country, setCountry] = useState("India");
  const [countryCode, setCountryCode] = useState("+91");
  const [mobileNumber, setMobileNumber] = useState("9516075967");
  const [language, setLanguage] = useState("English");
  const [gender, setGender] = useState("Male");
  const [dob, setDob] = useState("1996-08-15");
  const [slackId, setSlackId] = useState("U048ABC123");
  const [maritalStatus, setMaritalStatus] = useState("Single");
  const [profileImage, setProfileImage] = useState<string | null>(activeEmployee?.avatarUrl || null);

  // Security Settings Form State
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmNewPass, setConfirmNewPass] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("Profile settings saved successfully!", "success");
  };

  const handleGeneratePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*";
    let gen = "";
    for (let i = 0; i < 12; i++) {
      gen += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(gen);
    setShowPassword(true);
    showToast("Generated new strong password!", "info");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setProfileImage(uploadEvent.target.result as string);
          showToast("Profile photo updated!", "success");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* 1. Left Sub-Navigation Sidebar */}
      <div className="w-full lg:w-64 bg-white rounded-xl shadow-xs border border-slate-200/80 p-4 space-y-4 shrink-0 h-fit">
        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Navigation Items */}
        <div className="space-y-1 text-xs font-medium">
          <button
            onClick={() => setActiveNav("profile")}
            className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
              activeNav === "profile"
                ? "bg-[#eef4fc] text-[#1a73e8] font-semibold border-l-4 border-[#1a73e8]"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            Profile Settings
          </button>
          <button
            onClick={() => setActiveNav("security")}
            className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
              activeNav === "security"
                ? "bg-[#eef4fc] text-[#1a73e8] font-semibold border-l-4 border-[#1a73e8]"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            Security Settings
          </button>
        </div>
      </div>

      {/* 2. Main Right Container Card */}
      <div className="flex-1 bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
        {activeNav === "profile" && (
          <div>
            {/* Top Tabs */}
            <div className="flex items-center gap-8 px-6 pt-4 border-b border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setActiveTab("profile")}
                className={`pb-3 transition-colors relative ${
                  activeTab === "profile"
                    ? "text-[#1a73e8]"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Profile
                {activeTab === "profile" && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#1a73e8]"></span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("emergency")}
                className={`pb-3 transition-colors relative ${
                  activeTab === "emergency"
                    ? "text-[#1a73e8]"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Emergency Contacts
                {activeTab === "emergency" && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#1a73e8]"></span>
                )}
              </button>
            </div>

            {/* Tab 1: Profile Form */}
            {activeTab === "profile" && (
              <form onSubmit={handleSave} className="p-6 space-y-6 text-xs">
                {/* Profile Picture Box */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <span>Profile Picture</span>
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
                  </div>

                  <div className="w-full border border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50/40 relative group">
                    <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden text-slate-400 shadow-inner">
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-12 h-12 text-slate-400" />
                      )}
                    </div>

                    <label className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 shadow-xs cursor-pointer hover:bg-slate-50 transition-colors">
                      <Camera className="w-3.5 h-3.5 text-slate-500" />
                      <span>Change Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Row 1: Your Name, Your Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="block font-medium text-slate-600">
                      Your Name
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={salutation}
                        onChange={(e) => setSalutation(e.target.value)}
                        className="w-20 px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option>Mr</option>
                        <option>Ms</option>
                        <option>Mrs</option>
                        <option>Dr</option>
                      </select>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="block font-medium text-slate-600">
                      Your Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Row 2: Email Notifications, Google Calendar, Country */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-1">
                  {/* Receive email notifications? */}
                  <div className="space-y-2">
                    <label className="block font-medium text-slate-600">
                      Receive email notifications?
                    </label>
                    <div className="flex items-center gap-4 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="emailNotifs"
                          checked={emailNotifications === "enable"}
                          onChange={() => setEmailNotifications("enable")}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-slate-700">Enable</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="emailNotifs"
                          checked={emailNotifications === "disable"}
                          onChange={() => setEmailNotifications("disable")}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-slate-700">Disable</span>
                      </label>
                    </div>
                  </div>

                  {/* Enable Google Calender */}
                  <div className="space-y-2">
                    <label className="block font-medium text-slate-600">
                      Enable Google Calender
                    </label>
                    <div className="flex items-center gap-4 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="googleCal"
                          checked={googleCalendar === "yes"}
                          onChange={() => setGoogleCalendar("yes")}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-slate-700">Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="googleCal"
                          checked={googleCalendar === "no"}
                          onChange={() => setGoogleCalendar("no")}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-slate-700">No</span>
                      </label>
                    </div>
                  </div>

                  {/* Country */}
                  <div className="space-y-1.5">
                    <label className="block font-medium text-slate-600">
                      Country
                    </label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="India">🇮🇳 India</option>
                      <option value="United States">🇺🇸 United States</option>
                      <option value="United Kingdom">🇬🇧 United Kingdom</option>
                      <option value="UAE">🇦🇪 United Arab Emirates</option>
                    </select>
                  </div>
                </div>

                {/* Row 3: Mobile, Change Language, Gender */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-1">
                  {/* Mobile */}
                  <div className="space-y-1.5">
                    <label className="block font-medium text-slate-600">
                      Mobile
                    </label>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1 px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800">
                        <span>🇮🇳</span>
                        <span className="font-mono text-xs">{countryCode}</span>
                      </div>
                      <input
                        type="text"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Change Language */}
                  <div className="space-y-1.5">
                    <label className="block font-medium text-slate-600">
                      Change Language
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="English">🇬🇧 English</option>
                      <option value="Hindi">🇮🇳 Hindi</option>
                    </select>
                  </div>

                  {/* Gender */}
                  <div className="space-y-1.5">
                    <label className="block font-medium text-slate-600">
                      Gender
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                {/* Row 4: Date of Birth, Slack Member ID, Marital Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-1">
                  {/* Date of Birth */}
                  <div className="space-y-1.5">
                    <label className="block font-medium text-slate-600">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Slack Member ID */}
                  <div className="space-y-1.5">
                    <label className="block font-medium text-slate-600">
                      Slack Member ID
                    </label>
                    <input
                      type="text"
                      value={slackId}
                      onChange={(e) => setSlackId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Marital Status */}
                  <div className="space-y-1.5">
                    <label className="block font-medium text-slate-600">
                      Marital Status
                    </label>
                    <select
                      value={maritalStatus}
                      onChange={(e) => setMaritalStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option>Single</option>
                      <option>Married</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                {/* Bottom Save Button */}
                <div className="pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-semibold text-xs rounded-lg shadow-md shadow-blue-500/20 active:scale-95 transition-all"
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>Save</span>
                  </button>
                </div>
              </form>
            )}

            {/* Tab 2: Emergency Contacts */}
            {activeTab === "emergency" && (
              <div className="p-6 space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-slate-900">
                        Primary Contact: Rajesh Patel (Father)
                      </p>
                      <p className="text-slate-500 font-mono text-xs mt-0.5">
                        +91 9826012345 • rajesh.patel@example.com
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                      Verified
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => showToast("Emergency contact form opened", "info")}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg"
                  >
                    + Add Another Emergency Contact
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Security Settings Tab */}
        {activeNav === "security" && (
          <div className="p-6 space-y-5 text-xs">
            <h3 className="text-sm font-bold text-slate-800">
              Change Account Password
            </h3>

            <div className="max-w-md space-y-3">
              <div>
                <label className="block font-medium text-slate-600 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmNewPass}
                  onChange={(e) => setConfirmNewPass(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <button
                type="button"
                onClick={() => showToast("Password updated successfully!", "success")}
                className="px-5 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-semibold rounded-lg shadow-sm"
              >
                Update Password
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
